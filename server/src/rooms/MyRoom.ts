import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
import { BULLER_CONST, DAMAGE_BASE, EXPLOSION_RADIUS, GAME_HEIGHT, GAME_WIDTH, PLAYER_CONST, TILE_SIZE, TIME_STEP } from "@shared/const";
import PlayerServer from "../bodies/PlayerServer";
import Matter from "matter-js";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { parsePlayerLabel } from "@shared/utils";
import { InputPayload, GameMap, PlayerStartingPosition, QuadBlockType, ShootInfo } from "@shared/types";
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
        
        this.terrainManager = new TerrainManager(this.physicsManager, quadTree);
        this.terrainManager.createTerrain();
    }

    setupCollisionEvents() {
        Matter.Events.on(this.physicsManager.engine, "collisionStart", (event) => {
            for (const pair of event.pairs) {
                const { bodyA, bodyB } = pair;
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
                            this.applyDamage(sessionId, true);
                        }
                    }
                }

                if (hasPlayerCollision && labels.includes(RessourceKeys.Ground)) {
                    const sessionId = parsePlayerLabel(playerLabel).sessionId;
                    this.playerBodies.get(sessionId).isOnGround = true;
                }
            }
        });
    }

    fixedTick(deltaTime: number) {
        this.state.players.forEach((player, id) => {
            const playerBody = this.playerBodies.get(id);
            if (!playerBody) return;

            let input: InputPayload;
            while (input = player.inputQueue.shift()) {
                movePlayerFromInputs(playerBody, input);
                player.timeStamp = input.timeStamp;

                player.mouseX = input.mousePosition.x;
                player.mouseY = input.mousePosition.y;
            }
        });

        this.physicsManager.update(deltaTime);

        this.state.players.forEach((player, id) => {
            const playerBody = this.playerBodies.get(id);
            if (!playerBody) return;
            player.x = playerBody.getX();
            player.y = playerBody.getY();
        });
    }

    onJoin(client: Client, options: any) {
        const player = new Player();

        const startingPosition = this.playerStartingPositions.find((p) => p.playerId == null)
        startingPosition.playerId = client.sessionId;

        player.x = startingPosition.x;
        player.y = startingPosition.y;

        player.timeStamp = 0;
        player.hp = PLAYER_CONST.MAX_HP;

        const playerBody = new PlayerServer(client.sessionId, player.x, player.y);
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
                this.applyDamage(id, false);
            }
        });
    }

    applyDamage(playerId: string, directHit: boolean) {
        const playerRef = this.state.players.get(playerId);
        const damage = Math.round((DAMAGE_BASE) * (directHit ? 2 : 1) + (Math.random() * 15));

        playerRef.hp -= damage;

        if (playerRef.hp <= 0) {
            playerRef.hp = 0;
            playerRef.isAlive = false;
        }

        this.broadcast(RequestTypes.HealthUpdate, {
            playerId: playerId,
            hp: playerRef.hp,
        });
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