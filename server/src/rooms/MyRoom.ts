import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
import { BULLET_CONST, DEFAULT_MAP_ID, EXPLOSION_CONST, PLAYER_CONST, TILE_SIZE, TIME_STEP } from "@shared/const";
import Matter, { Body } from "matter-js";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { InputPayload, GameMap, PlayerStartingPosition, ShootInfo, RoomJoinOptions, RoomCreationOptions, PowerUpdateData, ExplosionInfo, PendingExplosion } from "@shared/types";
import QuadBlock from "@shared/data/QuadBlock";
import { generateBulletOriginPosition, shoot } from "@shared/logics/bullet-logic";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import TerrainManagerServer from "../managers/TerrainManagerServer";
import PhysicsManager from "../managers/PhysicsManager";
import path from "path";
import { readFile } from "fs/promises";
import dotenv from "dotenv";
import PlayerManagerServer from "../managers/PlayerManagerServer";
import PhaseManagerServer from "../managers/PhaseManagerServer";
import Phase from "@shared/data/phases/Phase";
import StartingPhase from "@shared/data/phases/StartingPhase";
import { canPlayerShoot } from "@shared/logics/player-logic";
import { Action } from "@shared/enums/Action.enum";
import { parsePlayerLabel } from "../server-utils";
import { Border } from "@shared/enums/Border.enum";
import { cleanPlayerName, generateDefaultRoomName } from "@shared/utils";
import { ServerErrorCode } from "@shared/enums/ServerErrorCode.enum";
import WaitingPhase from "@shared/data/phases/WaitingPhase";
import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import BulletServer from "../bodies/BulletServer";
import { Parameter } from "@shared/enums/Parameter.enum";

dotenv.config();

export class MyRoom extends Room<MyRoomState> {
    maxClients = 4;
    state = new MyRoomState();
    password?: string;

    playerStartingPositions: PlayerStartingPosition[] = [];

    terrainManager!: TerrainManagerServer;
    phaseManager!: PhaseManagerServer;
    physicsManager: PhysicsManager = new PhysicsManager();
    playerManager: PlayerManagerServer = new PlayerManagerServer();

    bullets: BulletServer[] = [];

    pendingExplosions: PendingExplosion[] = [];

    async onCreate(options: RoomCreationOptions) {
        this.patchRate = TIME_STEP;

        if (options.password) {
            this.setPrivate(true);
            this.password = options.password;
        }

        this.setMetadata({
            gameName: options.gameName ?? generateDefaultRoomName(options.playerData.name),
            mapId: options.mapId ?? DEFAULT_MAP_ID,
        });

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
        this.phaseManager = new PhaseManagerServer(this.playerManager, () => this.lock(), (phase) => this.broadcastPhase(phase));

        const mapId = options.mapId ?? this.getRandomMapId();
        await this.setupTerrain(mapId);
    }

    getRandomMapId() {
        const maps = ["mirrorhold", "floating_isles", "squares", "cave", "depths"];
        return maps[Math.floor(Math.random() * maps.length)];
    }

    onJoin(client: Client, options: RoomJoinOptions) {
        if (this.password && options.password !== this.password) throw new Error(ServerErrorCode.IncorrectPassword);

        const player = new Player();

        const startingPosition = this.playerStartingPositions.find((p) => p.playerId == null)
        if (!startingPosition) return;

        startingPosition.playerId = client.sessionId;

        player.pseudo = cleanPlayerName(options.playerData.name);
        player.x = startingPosition.x + PLAYER_CONST.BASE_WIDTH / 2;
        player.y = startingPosition.y;
        player.timeStamp = 0;
        player.hp = PLAYER_CONST.BASE_MAX_HP;

        this.playerManager.addPlayer(client.sessionId, player, (hp: number, damage?: number, directHit?: boolean) => this.onPlayerDamage(client.sessionId, hp, damage, directHit), this.physicsManager)
        this.state.players.set(client.sessionId, player);

        this.synchronizeFully(client);

        if (this.playerManager.getPlayerNb() === this.maxClients) { // if enough players we start the game
            this.phaseManager.start();
        }
    }

    onLeave(client: Client, consented: boolean) {
        if (this.playerManager.getPlayerNb() === 0) {
            this.phaseManager.stop();
        } else if (this.phaseManager.currentPhase instanceof StartingPhase || this.phaseManager.currentPhase instanceof WaitingPhase) {
            this.phaseManager.reset();
            const playerStartingPosition = this.playerStartingPositions.find((p) => p.playerId === client.sessionId);
            if (playerStartingPosition) playerStartingPosition.playerId = null
        } else {
            this.handleDisconnection(client);
        }

        this.playerManager.removePlayer(client.sessionId);
        this.state.players.delete(client.sessionId);
    }

    onDispose() { }

    handleDisconnection(client: Client) {
        // Mark the player as dead instead of removing them
        const playerBody = this.playerManager.getPlayer(client.sessionId);
        if (playerBody) {
            const player = this.state.players.get(client.sessionId);
            if (player) {
                player.hp = 0;
                player.isAlive = false;
                this.onPlayerDamage(client.sessionId, 0);
            }
            playerBody.instantDeath();
        }
    }

    setupMessages() {
        this.onMessage(RequestTypes.Move, (client, inputPayload: InputPayload) => {
            const player = this.state.players.get(client.sessionId);
            player?.inputQueue.push(inputPayload);
        });

        this.onMessage(RequestTypes.Shoot, (client, shootInfo: ShootInfo) => {
            const playerBody = this.playerManager.getPlayer(client.sessionId);
            if (!playerBody) return;

            if (canPlayerShoot(playerBody)) {
                this.phaseManager.disableAction(playerBody);
            } else { // can't shoot, refusing action
                return;
            }

            const originPosition = generateBulletOriginPosition(playerBody.getX(), playerBody.getY(), shootInfo.targetX, shootInfo.targetY, playerBody.powerManager.getParameterValue(Parameter.Size));

            const explosionInfo: ExplosionInfo = {
                explosionPushCoef: playerBody.powerManager.getParameterValue(Parameter.ExpPush),
                explosionSize: playerBody.powerManager.getParameterValue(Parameter.ExpSize),
                damage: playerBody.powerManager.getParameterValue(Parameter.Damage),
            };

            const bullet = new BulletServer(
                originPosition.x,
                originPosition.y,
                BULLET_CONST.RADIUS,
                explosionInfo
            );

            this.bullets.push(bullet);
            this.physicsManager.add(bullet);

            shoot(bullet, shootInfo.targetX, shootInfo.targetY, shootInfo.force);

            shootInfo.originX = originPosition.x;
            shootInfo.originY = originPosition.y;
            this.broadcast(RequestTypes.Shoot, {
                shootInfo: shootInfo,
                explosionInfo: explosionInfo
            }, { except: client });
        });

        this.onMessage(RequestTypes.TerrainSynchro, (client) => {
            this.synchronizeTerrain(client);
        });

        this.onMessage(RequestTypes.EndTurn, (client) => {
            this.phaseManager.endTurn(client.sessionId);
        });

        this.onMessage(RequestTypes.SelectAction, (client, data: { action: Action }) => {
            this.phaseManager.actionChoice(client.sessionId, data.action);
        });

        this.onMessage(RequestTypes.PowerUpdate, (client, powerUpdateData: PowerUpdateData) => {
            const player = this.playerManager.getPlayer(client.sessionId);
            player?.addPower(powerUpdateData.powerName);
            this.broadcast(RequestTypes.PowerUpdate, {
                id: client.sessionId,
                powerName: powerUpdateData.powerName
            }, { except: client });
        });
    }

    async setupTerrain(mapId: string = DEFAULT_MAP_ID) {
        const mapPath = path.resolve(__dirname, `../../maps/${mapId}.json`);
        const data = await readFile(mapPath, "utf-8");
        const map: GameMap = JSON.parse(data);

        const quadTree = QuadBlock.generateQuadBlockFromType(map.quadTree);
        this.playerStartingPositions = map.playerPositions;
        this.maxClients = this.playerStartingPositions.length;
        this.maxClients = 2; // TEMPORARY

        this.terrainManager = new TerrainManagerServer(this.physicsManager, quadTree);
        this.terrainManager.createTerrain();
    }

    setupCollisionEvents() {
        Matter.Events.on(this.physicsManager.engine, "collisionStart", (event) => {
            for (const pair of event.pairs) {
                const { bodyA, bodyB, collision } = pair;
                const labels = [bodyA.label, bodyB.label];
                const plugins = [bodyA.plugin, bodyB.plugin];
                const playerLabel = labels.find(label => label.startsWith(`${RessourceKeys.Player}:`));

                if (labels.includes(RessourceKeys.Bullet) && (labels.includes(RessourceKeys.Ground) || labels.includes(RessourceKeys.Border) || playerLabel)) {
                    const bullet = (bodyA.label === RessourceKeys.Bullet ? bodyA : bodyB) as any;

                    if (bullet.hasAlreadyExplosed) continue;

                    bullet.hasAlreadyExplosed = true;

                    if (bullet) {
                        const idx = this.bullets.findIndex(b => b.body === bullet);
                        if (idx !== -1) {
                            const [bulletObject] = this.bullets.splice(idx, 1);
                            const { explosionSize, explosionPushCoef, damage } = bulletObject.getExplosionInfo();

                            this.pendingExplosions.push({
                                cx: bulletObject.getX(),
                                cy: bulletObject.getY(),
                                radius: explosionSize,
                                pushCoef: explosionPushCoef,
                                damage: damage!,
                            });
                            this.explode(bulletObject);
                            bulletObject.removeFromWorld();

                            if (playerLabel) {
                                const sessionId = parsePlayerLabel(playerLabel).sessionId;
                                this.playerManager.getPlayer(sessionId)?.applyDamage(damage!, true);
                            }
                        }
                    }
                }

                if (playerLabel && (labels.includes(RessourceKeys.Ground) || plugins.includes(Border.Bottom))) {
                    const sessionId = parsePlayerLabel(playerLabel).sessionId;
                    const playerBody = this.playerManager.getPlayer(sessionId);

                    if (!playerBody) continue;

                    if (labels.includes(RessourceKeys.Ground)) { // Ground
                        const isPlayerA = bodyA.label.startsWith(`${RessourceKeys.Player}:`);

                        const normal = isPlayerA ? collision.normal : { x: -collision.normal.x, y: -collision.normal.y };

                        const isGroundCollision = normal.y < -0.3;
                        const isFalling = playerBody.getVelocity().y > 0.5;

                        if (isGroundCollision && isFalling) {
                            playerBody.isOnGround = true;
                        }
                    } else { // Bottom border
                        playerBody.instantDeath();
                    }
                }
            }
        });
    }


    fixedTick(deltaTime: number) {
        this.playerManager.applyInputs();

        this.bullets.forEach((bullet) => {
            bullet.nullifyBaseGravity();
        });

        this.physicsManager.update(deltaTime);

        this.pendingExplosions.forEach((pendingExplosion) => {
            this.playerManager.applyExplosion(pendingExplosion);
        });
        this.pendingExplosions = [];

        this.playerManager.updateRefsPosition();

        this.bullets.forEach((bullet) => {
            bullet.applyCustomGravity();
        });
    }

    explode(bullet: BulletServer, minSize: number = TILE_SIZE) {
        this.terrainManager.explodeTerrain(bullet, minSize);

        this.phaseManager.next(500);
    }

    broadcastDamage(playerId: string, hp: number, damage?: number, directHit?: boolean) {
        this.broadcast(RequestTypes.HealthUpdate, { playerId, hp, damage, directHit });
    }

    broadcastPhase(phase: Phase) {
        this.broadcast(RequestTypes.PhaseSynchro, phase);
    }

    synchronizeTerrain(client?: Client) {
        const content = this.terrainManager.root;
        if (client) {
            client.send(RequestTypes.TerrainSynchro, content);
        } else {
            this.broadcast(RequestTypes.TerrainSynchro, content);
        }
    }

    synchronizeFully(client?: Client) {
        const content = {
            terrain: this.terrainManager.root,
            phase: this.phaseManager.currentPhase
        };

        if (client) {
            client.send(RequestTypes.FullSynchro, content);
        } else {
            this.broadcast(RequestTypes.FullSynchro, content);
        }
    }

    onPlayerDamage(playerId: string, hp: number, damage?: number, directHit?: boolean) {
        this.broadcastDamage(playerId, hp, damage, directHit);

        const playersAlive = this.playerManager.getPlayersAlive();
        if (playersAlive.length === 1) {
            this.phaseManager.endGame();
            this.broadcast(RequestTypes.GameEnd, {
                winnerId: playersAlive[0].sessionId
            });
        }
    }
}