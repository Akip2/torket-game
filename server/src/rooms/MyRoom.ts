import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
import { BULLER_CONST, DAMAGE_BASE, EXPLOSION_RADIUS, GAME_HEIGHT, GAME_WIDTH, PLAYER_CONST, TILE_SIZE, TIME_STEP } from "@shared/const";
import PlayerServer from "../bodies/PlayerServer";
import Matter from "matter-js";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { parsePlayerLabel } from "@shared/utils";
import { InputPayload, GameMap, PlayerStartingPosition, QuadBlockType, ShootInfo, InitData } from "@shared/types";
import { isPlayerInRadius, movePlayerFromInputs, playerReactToExplosion } from "@shared/logics/player-logic";
import QuadBlock from "@shared/data/QuadBlock";
import BullerServer from "src/bodies/BulletServer";
import { generateBulletOriginPosition, shoot } from "@shared/logics/bullet-logic";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import TerrainManager from "src/managers/TerrainManager";
import PhysicsManager from "src/managers/PhysicsManager";
import path from "path";
import { readFile } from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

export class MyRoom extends Room<MyRoomState> {
    maxClients = 4;
    state = new MyRoomState();

    playerBodies: Map<string, PlayerServer> = new Map();

    playerStartingPositions: PlayerStartingPosition[] = [];

    terrainManager: TerrainManager;
    physicsManager: PhysicsManager = new PhysicsManager();

    async onCreate(options: any) {
        this.patchRate = TIME_STEP;

        let elapsedTime = 0;
        this.setSimulationInterval((deltaTime) => {
            elapsedTime += deltaTime;
            while (elapsedTime >= TIME_STEP) {
                elapsedTime -= TIME_STEP;
                this.fixedTick(TIME_STEP);
            }
        });

        this.setupMessages();
        this.setupCollisionEvents();
        await this.setupTerrain();
    }

    setupMessages() {
        this.onMessage(RequestTypes.Move, (client, inputPayload: InputPayload) => {
            const player = this.state.players.get(client.sessionId);
            player.inputQueue.push(inputPayload);
        });

        this.onMessage(RequestTypes.Shoot, (client, shootInfo: ShootInfo) => {
            const playerBody = this.playerBodies.get(client.sessionId);

            const originPosition = generateBulletOriginPosition(playerBody.getX(), playerBody.getY(), shootInfo.targetX, shootInfo.targetY);

            const bullet = new BullerServer(originPosition.x, originPosition.y, BULLER_CONST.RADIUS);
            this.physicsManager.add(bullet);

            shoot(bullet, shootInfo.targetX, shootInfo.targetY, shootInfo.force);

            shootInfo.originX = originPosition.x;
            shootInfo.originY = originPosition.y;
            this.broadcast(RequestTypes.Shoot, shootInfo, { except: client });
        });

        this.onMessage(RequestTypes.TerrainSynchro, (client) => {
            this.synchronizeTerrain(client);
        });
    }

    async setupTerrain() {
        const mapName = process.env.MAP_NAME ?? "test";
        const mapPath = path.resolve(__dirname, `../../maps/${mapName}.json`);
        const data = await readFile(mapPath, "utf-8");
        const map: GameMap = JSON.parse(data);

        const quadTree = QuadBlock.generateQuadBlockFromType(map.quadTree);
        this.playerStartingPositions = map.playerPositions;
        this.maxClients = this.playerStartingPositions.length;

        this.terrainManager = new TerrainManager(this.physicsManager, quadTree);
        this.terrainManager.createTerrain();
    }

    setupCollisionEvents() {
        Matter.Events.on(this.physicsManager.engine, "collisionStart", (event) => {
            for (const pair of event.pairs) {
                const { bodyA, bodyB, collision } = pair;
                const labels = [bodyA.label, bodyB.label];
                const playerLabel = labels.find(label => label.startsWith(`${RessourceKeys.Player}:`));

                const hasPlayerCollision = playerLabel ? true : false;

                if (labels.includes(RessourceKeys.Bullet) && (labels.includes(RessourceKeys.Ground) || hasPlayerCollision)) {
                    const bullet = (bodyA.label === RessourceKeys.Bullet ? bodyA : bodyB);

                    if (bullet) {
                        this.explode(bullet.position.x, bullet.position.y, EXPLOSION_RADIUS);
                        this.physicsManager.removeBrut(bullet);

                        if (hasPlayerCollision) {
                            const sessionId = parsePlayerLabel(playerLabel).sessionId;
                            this.playerBodies.get(sessionId)?.applyDamage(true);
                        }
                    }
                }

                if (hasPlayerCollision && labels.includes(RessourceKeys.Ground)) {
                    const sessionId = parsePlayerLabel(playerLabel).sessionId;
                    const playerBody = this.playerBodies.get(sessionId);

                    if (!playerBody) continue;

                    const isPlayerA = bodyA.label.startsWith(`${RessourceKeys.Player}:`);
                    const normal = isPlayerA ? collision.normal : { x: -collision.normal.x, y: -collision.normal.y };

                    const isGroundCollision = normal.y < -0.3;
                    const isFalling = playerBody.getVelocity().y > 0.5;

                    if (isGroundCollision && isFalling) {
                        playerBody.isOnGround = true;
                    }
                }
            }
        });
    }

    fixedTick(deltaTime: number) {
        this.playerBodies.forEach((playerBody, id) => {
            const queue = playerBody.getInputQueue();
            if (queue.length > 0) {
                const last = queue[queue.length - 1];
                playerBody.lastProcessedTimeStamp = last.timeStamp;
                playerBody.updatePlayerRefMouse(last.mousePosition);
            }

            let input: InputPayload;
            while (input = queue.shift()) {
                movePlayerFromInputs(playerBody, input);
            }
        });

        this.physicsManager.update(deltaTime);

        this.playerBodies.forEach((playerBody) => {
            playerBody.updatePlayerRefPosition();
        });
    }

    onJoin(client: Client, initData: InitData) {
        const player = new Player();

        const startingPosition = this.playerStartingPositions.find((p) => p.playerId == null)
        startingPosition.playerId = client.sessionId;

        player.pseudo = initData.name?.trim() || "Player";
        player.x = startingPosition.x;
        player.y = startingPosition.y;
        player.timeStamp = 0;
        player.hp = PLAYER_CONST.MAX_HP;

        const playerBody = new PlayerServer(player, client.sessionId, (hp: number) => this.broadcastDamage(client.sessionId, hp));
        this.physicsManager.add(playerBody);

        this.playerBodies.set(client.sessionId, playerBody);
        this.state.players.set(client.sessionId, player);

        this.synchronizeTerrain(client); // Sending terrain to connecting client
    }

    onLeave(client: Client, consented: boolean) {
        const playerBody = this.playerBodies.get(client.sessionId);
        if (playerBody) {
            this.physicsManager.remove(playerBody);
            this.playerBodies.delete(client.sessionId);
        }
        this.state.players.delete(client.sessionId);

        this.playerStartingPositions.find((p) => p.playerId === client.sessionId).playerId = null;
    }

    onDispose() { }

    explode(cx: number, cy: number, radius: number, minSize: number = TILE_SIZE) {
        this.terrainManager.explodeTerrain(cx, cy, EXPLOSION_RADIUS);
        this.playerBodies.forEach((p, id) => {
            playerReactToExplosion(p, cx, cy, radius);

            if (isPlayerInRadius(p, cx, cy, radius)) {
                this.playerBodies.get(id)?.applyDamage(false);
            }
        });
    }

    broadcastDamage(playerId: string, hp: number) {
        this.broadcast(RequestTypes.HealthUpdate, { playerId, hp });
    }

    synchronizeTerrain(client?: Client) {
        const content = this.terrainManager.root;
        if (client) {
            client.send(RequestTypes.TerrainSynchro, content);
        } else {
            this.broadcast(RequestTypes.TerrainSynchro, content);
        }
    }
}