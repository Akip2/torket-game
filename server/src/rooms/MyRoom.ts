import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
import { Engine } from "matter-js"
import { GAME_HEIGHT, GAME_WIDTH, GRAVITY } from "@shared/const";
import PlayerServer from "../bodies/PlayerServer";
import TerrainBlock from "../bodies/TerrainBlock";
import Matter from "matter-js";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { parsePlayerLabel } from "@shared/utils";
import { InputPayload } from "@shared/types";
import { movePlayerFromInputs } from "@shared/logics/player-logic";
import QuadBlock from "@shared/data/QuadBlock";

export class MyRoom extends Room<MyRoomState> {
    elapsedTime = 0;
    fixedTimeStep = 1000 / 60;
    maxClients = 4;
    state = new MyRoomState();

    engine!: Engine;
    playerBodies: Map<string, PlayerServer> = new Map();

    root: QuadBlock;
    terrainBlocks: TerrainBlock[] = [];

    onCreate(options: any) {
        this.onMessage("move", (client, inputPayload: InputPayload) => {
            const player = this.state.players.get(client.sessionId);
            player.inputQueue.push(inputPayload);
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
    }

    setupEnvironment() {
        this.engine = Engine.create({
            gravity: { x: 0, y: GRAVITY }
        });

        this.root = new QuadBlock(
            0,
            GAME_HEIGHT - GAME_HEIGHT / 5,
            GAME_WIDTH,
            GAME_HEIGHT / 5,
        );

        this.createTerrain();
        this.setupCollisionEvents();
    }

    setupCollisionEvents() {
        Matter.Events.on(this.engine, "collisionStart", (event) => {
            for (const pair of event.pairs) {
                const { bodyA, bodyB } = pair;
                const labels = [bodyA.label, bodyB.label];
                const playerLabel = labels.find(label => label.startsWith("player:"));
                if (playerLabel && labels.includes(RessourceKeys.Ground)) {
                    const sessionId = parsePlayerLabel(playerLabel).sessionId;
                    this.playerBodies.get(sessionId).isOnGround = true;
                }
            }
        });
    }

    fixedTick(deltaTime: number) {
        // Appliquer les inputs
        this.state.players.forEach((player, id) => {
            const playerBody = this.playerBodies.get(id);
            if (!playerBody) return;

            let input: InputPayload;
            while (input = player.inputQueue.shift()) {
                movePlayerFromInputs(playerBody, input);
                player.timeStamp = input.timeStamp; // réconciliation côté client
            }
        });

        Engine.update(this.engine, deltaTime);

        // Synchronisation
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

    createTerrain() {
        this.createTerrainBlock(this.root);
    }

    recreateTerrain() {
        this.terrainBlocks.forEach(t => t.removeFromWorld(this.engine.world));
        this.createTerrain();
    }

    createTerrainBlock(block: QuadBlock) {
        if (block.isEmpty()) return;

        if (block.filled) {
            const terrainBlock = new TerrainBlock(
                block.x + block.width / 2,
                block.y + block.height / 2,
                block.width,
                block.height
            )

            this.terrainBlocks.push(terrainBlock);
            terrainBlock.addToWorld(this.engine.world);
        } else if (block.hasChildren()) {
            for (const child of block.children) {
                this.createTerrainBlock(child);
            }
        }
    }
}