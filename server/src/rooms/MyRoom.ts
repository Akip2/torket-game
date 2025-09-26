import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
import { Engine, World } from "matter-js"
import { BULLER_CONST, EXPLOSION_RADIUS, GAME_HEIGHT, GAME_WIDTH, GRAVITY, TILE_SIZE } from "@shared/const";
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

export class MyRoom extends Room<MyRoomState> {
    elapsedTime = 0;
    fixedTimeStep = 1000 / 60;
    maxClients = 4;
    state = new MyRoomState();

    engine!: Engine;
    playerBodies: Map<string, PlayerServer> = new Map();

    terrainManager: TerrainManager;

    onCreate(options: any) {
        this.onMessage(RequestTypes.Move, (client, inputPayload: InputPayload) => {
            const player = this.state.players.get(client.sessionId);
            player.inputQueue.push(inputPayload);
        });

        this.onMessage(RequestTypes.Shoot, (client, shootInfo: ShootInfo) => {
            const playerBody = this.playerBodies.get(client.sessionId);
            const bullet = new BullerServer(playerBody.getX(), playerBody.getY(), BULLER_CONST.RADIUS);
            bullet.addToWorld(this.engine.world);

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

        this.setupEnvironment();
        this.setupTerrain();
    }

    setupTerrain() {
        const defaultMap = new QuadBlock(
            0,
            GAME_HEIGHT - GAME_HEIGHT / 5,
            GAME_WIDTH,
            GAME_HEIGHT / 5,
        );

        this.terrainManager = new TerrainManager(this.engine, defaultMap);
        this.terrainManager.createTerrain();
    }

    setupEnvironment() {
        this.engine = Engine.create({
            gravity: { x: 0, y: GRAVITY }
        });
        this.setupCollisionEvents();
    }

    setupCollisionEvents() {
        Matter.Events.on(this.engine, "collisionStart", (event) => {
            for (const pair of event.pairs) {
                const { bodyA, bodyB } = pair;
                const labels = [bodyA.label, bodyB.label];
                const playerLabel = labels.find(label => label.startsWith("player:"));

                if (labels.includes(RessourceKeys.Bullet) && labels.includes(RessourceKeys.Ground)) {
                    const bullet = (bodyA.label === RessourceKeys.Bullet ? bodyA : bodyB);

                    if (bullet) {
                        this.explode(bullet.position.x, bullet.position.y, EXPLOSION_RADIUS);
                        World.remove(this.engine.world, bullet);
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

        Engine.update(this.engine, deltaTime);

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
        playerBody.addToWorld(this.engine.world);
        this.playerBodies.set(client.sessionId, playerBody);
        this.state.players.set(client.sessionId, player);
    }

    onLeave(client: Client, consented: boolean) {
        const playerBody = this.playerBodies.get(client.sessionId);
        if (playerBody) {
            playerBody.removeFromWorld(this.engine.world);
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
    }
}