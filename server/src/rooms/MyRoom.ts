import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
import { DEBUG, DEFAULT_MAP_ID, PLAYER_CONST, QUICKPLAY_MAPS, TILE_SIZE, TIME_STEP } from "@shared/const";
import Matter from "matter-js";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { InputPayload, GameMap, PlayerStartingPosition, ShootInfo, RoomJoinOptions, RoomCreationOptions, PowerUpdateData, ExplosionInfo, PendingExplosion, PlayerData } from "@shared/types";
import QuadBlock from "@shared/data/QuadBlock";
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
import { cleanPlayerName, generateDefaultRoomName, wait } from "@shared/utils";
import { ServerErrorCode } from "@shared/enums/ServerErrorCode.enum";
import WaitingPhase from "@shared/data/phases/WaitingPhase";
import BulletServer from "../bodies/BulletServer";
import { CapturePointManagerServer } from "../managers/CapturePointManagerServer";
import { Team } from "@shared/enums/Team.enum.ts";
import { WinCondition } from "@shared/enums/WinCondition.enum";
import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import HumanPlayer from "../bodies/HumanPlayer";
import Bot from "../bodies/Bot";
import BotPerception from "../bot-intelligence/BotPerception";
import BasicGameAction from "../game-action/BasicGameAction";

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
    capturePointManager!: CapturePointManagerServer;
    gameActionManager!: BasicGameAction;

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
        this.phaseManager = new PhaseManagerServer(this.playerManager, () => { this.onGameStart() }, (phase) => this.broadcastPhase(phase));
        this.gameActionManager = new BasicGameAction(this);

        const mapId = options.mapId ?? this.getRandomMapId();
        await this.setupTerrain(mapId);
    }

    onGameStart() {
        this.lock();
        this.playerManager.initBulletCounts();
    }

    getRandomMapId() {
        return QUICKPLAY_MAPS[Math.floor(Math.random() * QUICKPLAY_MAPS.length)];
    }

    onJoin(client: Client, options: RoomJoinOptions) {
        if (this.password && options.password !== this.password) throw new Error(ServerErrorCode.IncorrectPassword);

        this.instantiatePlayer(client.sessionId, options.playerData, false);
        this.firstSynchronization(client);
    }

    onLeave(client: Client, consented: boolean) {
        if (this.playerManager.getPlayerNb() === 0) {
            this.phaseManager.stop();
        } else if (this.phaseManager.getCurrentPhase() instanceof StartingPhase || this.phaseManager.getCurrentPhase() instanceof WaitingPhase) {
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
            this.gameActionManager.handleInputs(player!, inputPayload);
        });

        this.onMessage(RequestTypes.Shoot, (client, shootInfo: ShootInfo) => {
            this.gameActionManager.handleShoot(client.sessionId, shootInfo, client);
        });

        this.onMessage(RequestTypes.EndTurn, (client) => {
            this.gameActionManager.handleEndTurn(client.sessionId);
        });

        this.onMessage(RequestTypes.SelectAction, (client, data: { action: Action }) => {
            this.gameActionManager.handleActionChoice(client.sessionId, data.action);
        });

        this.onMessage(RequestTypes.FullSynchro, (client) => {
            this.synchronizeFully(client);
        });

        this.onMessage(RequestTypes.TerrainSynchro, (client) => {
            this.synchronizeTerrain(client);
        });

        this.onMessage(RequestTypes.PowerUpdate, (client, powerUpdateData: PowerUpdateData) => {
            const player = this.playerManager.getPlayer(client.sessionId);
            player?.addPower(powerUpdateData.powerName);
            this.broadcast(RequestTypes.PowerUpdate, {
                id: client.sessionId,
                powerName: powerUpdateData.powerName
            }, { except: client });
        });

        this.onMessage(RequestTypes.AddBots, (client) => {
            this.instantiatePlayer("bot", { name: "Bob" }, true);
        });

        this.onMessage(RequestTypes.Debug, (client) => {
            this.debugFunction();
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

        this.terrainManager = new TerrainManagerServer(this.physicsManager, quadTree, map.bounds);
        this.terrainManager.createEnvironment();

        this.capturePointManager = new CapturePointManagerServer(this.physicsManager, map.capturePoints, (id, newOwningTeam) => { this.onCapture(id, newOwningTeam) });
    }

    setupCollisionEvents() {
        Matter.Events.on(this.physicsManager.engine, "collisionStart", (event) => {
            for (const pair of event.pairs) {
                const { bodyA, bodyB, collision } = pair;
                const labels = [bodyA.label, bodyB.label];
                const plugins = [bodyA.plugin, bodyB.plugin];
                const playerLabel = labels.find(label => label.startsWith(`${RessourceKeys.Player}:`));

                if (labels.includes(RessourceKeys.Bullet) && (labels.includes(RessourceKeys.Ground) || labels.includes(RessourceKeys.CapturePoint) || labels.includes(RessourceKeys.Border) || playerLabel)) {
                    const isBulletA = (bodyA.label === RessourceKeys.Bullet);
                    const bullet = (isBulletA ? bodyA : bodyB) as any;

                    if (labels.includes(RessourceKeys.CapturePoint)) {
                        const otherBody = isBulletA ? bodyB : bodyA;
                        this.capturePointManager.manageContact(otherBody.plugin, bullet.plugin, true);
                        continue;
                    }

                    if (bullet.hasAlreadyExplosed) continue;
                    bullet.hasAlreadyExplosed = true;

                    const idx = this.bullets.findIndex(b => b.body === bullet);
                    if (idx === -1) return;
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

                if (playerLabel && (labels.includes(RessourceKeys.Ground) || labels.includes(RessourceKeys.CapturePoint) || labels.includes(RessourceKeys.Border))) {
                    const sessionId = parsePlayerLabel(playerLabel).sessionId;
                    const playerBody = this.playerManager.getPlayer(sessionId);
                    const isPlayerA = bodyA.label.startsWith(`${RessourceKeys.Player}:`);
                    const otherBody = isPlayerA ? bodyB : bodyA;

                    if (!playerBody) continue;

                    if (labels.includes(RessourceKeys.Ground)) { // Ground
                        const normal = isPlayerA ? collision.normal : { x: -collision.normal.x, y: -collision.normal.y };

                        const isGroundCollision = normal.y < -0.3;

                        if (isGroundCollision) {
                            playerBody.isOnGround = true;
                            playerBody.resetJumpCost();
                        }
                    } else if (labels.includes(RessourceKeys.CapturePoint)) { // CapturePoint
                        this.capturePointManager.manageContact(otherBody.plugin, playerBody.getTeam(), false);
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

        if (this.phaseManager.getCurrentPhase().type === PhaseTypes.Shooting && this.phaseManager.getConcernedPlayerId()) {
            const concernedPlayer = this.playerManager.getPlayer(this.phaseManager.getConcernedPlayerId()!);
            if (concernedPlayer && !canPlayerShoot(concernedPlayer)) {
                this.phaseManager.next(500);
            }
        }
    }

    broadcastDamage(playerId: string, hp: number, damage?: number, directHit?: boolean) {
        this.broadcast(RequestTypes.HealthUpdate, { playerId, hp, damage, directHit });
    }

    broadcastPhase(phase: Phase) {
        this.broadcast(RequestTypes.PhaseSynchro, phase);
    }

    broadcastCapture(id: number, newOwningTeam: Team | null) {
        this.broadcast(RequestTypes.Capture, {
            id: id,
            newOwningTeam: newOwningTeam
        })
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
            capturePoints: this.capturePointManager.getSerializedCapturePoints(),
            phase: this.phaseManager.getCurrentPhase()
        };

        if (client) {
            client.send(RequestTypes.FullSynchro, content);
        } else {
            this.broadcast(RequestTypes.FullSynchro, content);
        }
    }

    firstSynchronization(client: Client) {
        const content = {
            terrain: this.terrainManager.root,
            capturePoints: this.capturePointManager.getSerializedCapturePoints(),
            phase: this.phaseManager.getCurrentPhase(),
            bounds: this.terrainManager.bounds
        };

        client.send(RequestTypes.FirstSynchro, content);
    }

    onCapture(id: number, newOwningTeam: Team | null) {
        this.broadcastCapture(id, newOwningTeam);
        const winnerTeam = this.capturePointManager.getWinner();

        if (winnerTeam) {
            const teamPlayers = this.playerManager.getTeamPlayers(winnerTeam);
            this.endGame(teamPlayers.map(p => p.sessionId), WinCondition.Capture);
        }
    }

    onPlayerDamage(playerId: string, hp: number, damage?: number, directHit?: boolean) {
        this.broadcastDamage(playerId, hp, damage, directHit);

        const playersAlive = this.playerManager.getPlayersAlive();
        if (playersAlive.length === 1) {
            this.endGame([playersAlive[0].sessionId], WinCondition.Kill);
        }
    }

    endGame(winnerIds: string[], winCondition: WinCondition) {
        this.phaseManager.endGame();

        this.broadcast(RequestTypes.GameEnd, {
            winnerIds: winnerIds,
            winCondition: winCondition
        });
    }

    instantiatePlayer(sessionId: string, playerData: PlayerData, bot: boolean = false) {
        if (this.playerManager.getPlayerNb() === this.maxClients) return;

        const player = new Player();

        const startingPosition = this.playerStartingPositions.find((p) => p.playerId == null)
        if (!startingPosition) return;

        startingPosition.playerId = sessionId;

        player.pseudo = cleanPlayerName(playerData.name);
        player.x = startingPosition.x + PLAYER_CONST.BASE_WIDTH / 2;
        player.y = startingPosition.y;
        player.timeStamp = 0;
        player.hp = PLAYER_CONST.BASE_MAX_HP;
        player.team = (this.playerManager.getPlayerNb() % 2 == 0) ? Team.Blue : Team.Red;

        let playerBody;
        if (!bot) {
            playerBody = new HumanPlayer(player, sessionId, (hp: number, damage?: number, directHit?: boolean) => this.onPlayerDamage(sessionId, hp, damage, directHit));
        } else {
            playerBody = new Bot(player, sessionId, this, (hp: number, damage?: number, directHit?: boolean) => this.onPlayerDamage(sessionId, hp, damage, directHit));
        }

        this.playerManager.addPlayer(sessionId, playerBody);
        this.state.players.set(sessionId, player);
        this.physicsManager.add(playerBody);

        if (this.playerManager.getPlayerNb() === this.maxClients) { // if enough players we start the wgame
            this.phaseManager.start();
        }
    }

    async debugFunction() {
        if (!DEBUG) return;

        for (let i = 0; i < this.capturePointManager.getCapturePointsNb(); i++) {
            this.capturePointManager.manageContact(i, Team.Blue, true);
            await wait(500);
        }
    }
}