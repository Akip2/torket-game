import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
import { BULLER_CONST, DAMAGE_BASE, EXPLOSION_RADIUS, PLAYER_CONST, TILE_SIZE, TIME_STEP } from "@shared/const";
import Matter from "matter-js";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { parsePlayerLabel } from "@shared/utils";
import { InputPayload, GameMap, PlayerStartingPosition, ShootInfo, InitData } from "@shared/types";
import QuadBlock from "@shared/data/QuadBlock";
import BullerServer from "src/bodies/BulletServer";
import { generateBulletOriginPosition, shoot } from "@shared/logics/bullet-logic";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import TerrainManager from "src/managers/TerrainManager";
import PhysicsManager from "src/managers/PhysicsManager";
import path from "path";
import { readFile } from "fs/promises";
import dotenv from "dotenv";
import PlayerManager from "src/managers/PlayerManager";

dotenv.config();

export class MyRoom extends Room<MyRoomState> {
    maxClients = 4;
    state = new MyRoomState();

    playerStartingPositions: PlayerStartingPosition[] = [];

    terrainManager: TerrainManager;
    physicsManager: PhysicsManager = new PhysicsManager();
    playerManager: PlayerManager = new PlayerManager();

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
            const playerBody = this.playerManager.getPlayer(client.sessionId);

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
                            this.playerManager.getPlayer(sessionId)?.applyDamage(true);
                        }
                    }
                }

                if (hasPlayerCollision && labels.includes(RessourceKeys.Ground)) {
                    const sessionId = parsePlayerLabel(playerLabel).sessionId;
                    const playerBody = this.playerManager.getPlayer(sessionId);

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
        this.playerManager.applyInputs();

        this.physicsManager.update(deltaTime);

        this.playerManager.updateRefsPosition();
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

        this.playerManager.addPlayer(client.sessionId, player, (hp: number) => this.broadcastDamage(client.sessionId, hp), this.physicsManager)
        this.state.players.set(client.sessionId, player);

        this.synchronizeTerrain(client); // Sending terrain to connecting client
    }

    onLeave(client: Client, consented: boolean) {
        this.playerManager.removePlayer(client.sessionId, this.physicsManager);
        this.state.players.delete(client.sessionId);

        this.playerStartingPositions.find((p) => p.playerId === client.sessionId).playerId = null;
    }

    onDispose() { }

    explode(cx: number, cy: number, radius: number, minSize: number = TILE_SIZE) {
        this.terrainManager.explodeTerrain(cx, cy, EXPLOSION_RADIUS);
        this.playerManager.applyExplosion(cx, cy, radius);
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