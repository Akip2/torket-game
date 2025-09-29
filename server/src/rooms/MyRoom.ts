import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
import { BULLER_CONST, EXPLOSION_RADIUS, GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from "@shared/const";
import PlayerServer from "../bodies/PlayerServer";
import Matter from "matter-js";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { parsePlayerLabel } from "@shared/utils";
import { InputPayload, ShootInfo } from "@shared/types";
import { movePlayerFromInputs, pushPlayer } from "@shared/logics/player-logic";
import QuadBlock from "@shared/data/QuadBlock";
import BullerServer from "src/bodies/BulletServer";
import { shoot } from "@shared/logics/bullet-logic";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import TerrainManager from "src/managers/TerrainManager";
import PhysicsManager from "src/managers/PhysicsManager";

export class MyRoom extends Room<MyRoomState> {
    fixedTimeStep = 1000 / 60;
    maxClients = 4;
    state = new MyRoomState();

    playerBodies: Map<string, PlayerServer> = new Map();

    terrainManager: TerrainManager;
    physicsManager: PhysicsManager = new PhysicsManager();

    onCreate(options: any) {
        this.onMessage(RequestTypes.Move, (client, inputPayload: InputPayload) => {
            const player = this.state.players.get(client.sessionId);
            player.inputQueue.push(inputPayload);
        });

        this.onMessage(RequestTypes.Shoot, (client, shootInfo: ShootInfo) => {
            const playerBody = this.playerBodies.get(client.sessionId);
            const bullet = new BullerServer(playerBody.getX(), playerBody.getY(), BULLER_CONST.RADIUS);
            this.physicsManager.add(bullet);

            shoot(bullet, shootInfo.x, shootInfo.y, shootInfo.force);
        });

        let elapsedTime = 0;
        this.setSimulationInterval((deltaTime) => {
            elapsedTime += deltaTime;
            while (elapsedTime >= this.fixedTimeStep) {
                elapsedTime -= this.fixedTimeStep;
                this.fixedTick(this.fixedTimeStep);
            }
        });

        this.setupCollisionEvents();
        this.setupTerrain();
    }

    setupTerrain() {
        const defaultMap = new QuadBlock(
            0,
            GAME_HEIGHT - GAME_HEIGHT / 5,
            GAME_WIDTH,
            GAME_HEIGHT / 5,
        );

        this.terrainManager = new TerrainManager(this.physicsManager, defaultMap);
        this.terrainManager.createTerrain();
    }

    setupCollisionEvents() {
        Matter.Events.on(this.physicsManager.engine, "collisionStart", (event) => {
            for (const pair of event.pairs) {
                const { bodyA, bodyB } = pair;
                const labels = [bodyA.label, bodyB.label];
                const playerLabel = labels.find(label => label.startsWith(`${RessourceKeys.Player}:`));

                if (labels.includes(RessourceKeys.Bullet) && labels.includes(RessourceKeys.Ground)) {
                    const bullet = (bodyA.label === RessourceKeys.Bullet ? bodyA : bodyB);

                    if (bullet) {
                        this.explode(bullet.position.x, bullet.position.y, EXPLOSION_RADIUS);
                        this.physicsManager.removeBrut(bullet);
                    }
                }

                if (playerLabel && labels.includes(RessourceKeys.Ground)) {
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
        player.x = Math.random() * GAME_WIDTH;
        player.y = 0;
        player.timeStamp = 0;

        const playerBody = new PlayerServer(client.sessionId, player.x, player.y);
        this.physicsManager.add(playerBody);

        this.playerBodies.set(client.sessionId, playerBody);
        this.state.players.set(client.sessionId, player);
    }

    onLeave(client: Client, consented: boolean) {
        const playerBody = this.playerBodies.get(client.sessionId);
        if (playerBody) {
            this.physicsManager.remove(playerBody);
            this.playerBodies.delete(client.sessionId);
        }
        this.state.players.delete(client.sessionId);
    }

    onDispose() { }

    explode(cx: number, cy: number, radius: number, minSize: number = TILE_SIZE) {
        this.terrainManager.explodeTerrain(cx, cy, EXPLOSION_RADIUS);
        this.playerBodies.forEach(p => {
            pushPlayer(p, cx, cy, radius);
        });

        this.updateTerrain();
    }

    /**
     * Updates terrain reference and sends it to client
     */
    updateTerrain() {
        this.state.terrain.clear();
        this.state.terrain.push(this.terrainManager.getQuadBlockState());
    }
}