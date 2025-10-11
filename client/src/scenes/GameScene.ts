import { EXPLOSION_RADIUS, GAME_HEIGHT, GAME_WIDTH, TEXTURE_SIZE, TILE_SIZE, TIME_STEP } from "@shared/const";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import BulletClient from "../game-objects/BulletClient";
import PlayerClient from "../game-objects/PlayerClient";
import { Client, Room, getStateCallbacks } from "colyseus.js";
import type { InputPayload } from "@shared/types";
import { applyDamage, movePlayerFromInputs, playerReactToExplosion } from "@shared/logics/player-logic";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import TextureManager from "../managers/TextureManager";
import TerrainManager from "../managers/TerrainManager";
import QuadBlock from "@shared/data/QuadBlock";
import { getExplosionSpriteScale } from "@shared/utils";
import ShotManager from "../managers/ShotManager";

export default class GameScene extends Phaser.Scene {
    client = new Client("ws://localhost:2567");
    room!: Room;

    debugGraphics: Phaser.GameObjects.Graphics[] = [];

    elapsedTime = 0;

    localInputBuffer: InputPayload[] = [];
    keyboard!: Phaser.Types.Input.Keyboard.CursorKeys;

    playerObjects: { [sessionId: string]: PlayerClient } = {};
    currentPlayer!: PlayerClient;
    remoteRef!: Phaser.GameObjects.Rectangle;

    terrainManager!: TerrainManager;
    shotManager!: ShotManager;

    currentMousePosition: { x: number, y: number } = { x: 0, y: 0 }

    constructor(name: string) {
        super(name);
    }

    preload() {
        this.keyboard = this.input.keyboard!.createCursorKeys();
        this.load.image(RessourceKeys.Ground, `assets/ground/ground_${TEXTURE_SIZE}.png`);
        this.load.image(RessourceKeys.Particle, 'assets/explosion/particle.png');
    }

    async create() {
        try {
            await this.setupRoomEvents();
        } catch (e) {
            console.log(e);
            throw e;
        }

        new TextureManager(this.add).generateTextures();

        const defaultMap = new QuadBlock(
            0,
            GAME_HEIGHT - GAME_HEIGHT / 5,
            GAME_WIDTH,
            GAME_HEIGHT / 5,
        );
        this.terrainManager = new TerrainManager(this, defaultMap);
        this.shotManager = new ShotManager(this);

        this.terrainManager.drawTerrain();
        this.terrainManager.createTerrainColliders();
        this.setupCollisionEvents();

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.pointerDownEvent(pointer));
        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => this.pointerUpEvent(pointer));
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.pointerMoveEvent(pointer));
    }

    async setupRoomEvents() {
        this.room = await this.client.joinOrCreate("my_room");

        const $ = getStateCallbacks(this.room);

        $(this.room.state).players.onAdd((player: any, sessionId: string) => {
            const playerObject = new PlayerClient(this, player.x, player.y);
            this.playerObjects[sessionId] = playerObject;

            const playerInstantUpdate = (player: any) => {
                playerObject.hp = player.hp;
                playerObject.isAlive = player.isAlive;
            }

            if (sessionId === this.room.sessionId) {
                this.currentPlayer = playerObject;
                this.remoteRef = this.add.rectangle(0, 0, playerObject.width, playerObject.height);
                this.remoteRef.setStrokeStyle(1, 0xff0000);

                $(player).onChange(() => {
                    playerInstantUpdate(player);
                    
                    const serverX = player.x;
                    const serverY = player.y;
                    const predictedX = this.currentPlayer.x;
                    const predictedY = this.currentPlayer.y;
                    const THRESHOLD = 2;

                    if (Math.abs(serverX - predictedX) > THRESHOLD || Math.abs(serverY - predictedY) > THRESHOLD) {
                        this.currentPlayer.x = serverX;
                        this.currentPlayer.y = serverY;
                        this.localInputBuffer = this.localInputBuffer.filter(input => input.timeStamp > player.timeStamp);

                        for (const input of this.localInputBuffer) {
                            movePlayerFromInputs(this.currentPlayer, input, true);
                        }
                    }
                    this.remoteRef.x = serverX;
                    this.remoteRef.y = serverY;
                });
            } else {
                $(player).onChange(() => {
                    playerInstantUpdate(player);

                    playerObject.setData("serverX", player.x);
                    playerObject.setData("serverY", player.y);
                    playerObject.setData("mousePosition", {
                        x: player.mouseX,
                        y: player.mouseY
                    });
                });
            }
        });

        $(this.room.state).players.onRemove((_player: any, sessionId: string) => {
            this.playerObjects[sessionId].destroy();
            delete this.playerObjects[sessionId];
        });

        this.room.onMessage(RequestTypes.TerrainSynchro, (quadBlock) => {
            this.terrainManager.constructQuadBlock(quadBlock);
            this.terrainManager.redrawTerrain();
        });

        this.room.onMessage(RequestTypes.Shoot, (shootInfo) => {
            this.shotManager.shootBulletFromInfo(shootInfo);
        });
    }

    fixedTick() {
        if (!this.room) { return; }

        const inputPayload = {
            left: this.keyboard.left.isDown,
            right: this.keyboard.right.isDown,
            up: this.keyboard.up.isDown,
            down: this.keyboard.down.isDown,

            mousePosition: this.currentMousePosition,
            timeStamp: Date.now()
        };

        this.room.send(RequestTypes.Move, inputPayload);
        this.localInputBuffer.push(inputPayload);

        movePlayerFromInputs(this.currentPlayer, inputPayload);

        for (const sessionId in this.playerObjects) {
            const playerObject = this.playerObjects[sessionId];
            if (sessionId !== this.room.sessionId) {
                const { serverX, serverY, mousePosition } = playerObject.data.values;
                playerObject.x = Phaser.Math.Linear(playerObject.x, serverX, 0.175);
                playerObject.y = Phaser.Math.Linear(playerObject.y, serverY, 0.35);

                playerObject.updateGunPlacement(mousePosition);
            } else {
                playerObject.updateGunPlacement(this.currentMousePosition);
            }
            
            playerObject.updateHealthBar();
        }
    }

    update(_time: number, delta: number): void {
        if (!this.currentPlayer) { return; }
        this.elapsedTime += delta;
        while (this.elapsedTime >= TIME_STEP) {
            this.elapsedTime -= TIME_STEP;
            this.fixedTick();
        }
    }

    setupCollisionEvents() {
        this.matter.world.on("collisionstart", (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
            for (const { bodyA, bodyB } of event.pairs) {
                const labels = [bodyA.label, bodyB.label];

                if (labels.includes(RessourceKeys.Bullet) && (labels.includes(RessourceKeys.Ground) || labels.includes(RessourceKeys.Player))) {
                    let bullet, otherBody;

                    if (bodyA.label === RessourceKeys.Bullet) {
                        bullet = bodyA.gameObject as BulletClient;
                        otherBody = bodyB;
                    } else {
                        bullet = bodyB.gameObject as BulletClient;
                        otherBody = bodyA;
                    }

                    if (bullet) {
                        this.explode(bullet.x, bullet.y, EXPLOSION_RADIUS);
                        bullet.destroy();

                        if (otherBody.label === RessourceKeys.Player) {
                            applyDamage(otherBody.gameObject as PlayerClient, true);
                        }
                    }
                }

                if (labels.includes(RessourceKeys.Player) && labels.includes(RessourceKeys.Ground)) {
                    const player = (bodyA.label === RessourceKeys.Player ? bodyA.gameObject : bodyB.gameObject) as PlayerClient;
                    player.isOnGround = true;
                }
            }
        });
    }

    explode(cx: number, cy: number, radius: number, minSize: number = TILE_SIZE) {
        //Explosion particles
        const scale = getExplosionSpriteScale(radius);
        const speedCoef = Math.max(scale * 0.5, 1);

        const emitter = this.add.particles(cx, cy, RessourceKeys.Particle, {
            lifespan: 500,
            speed: {
                min: 100 * speedCoef,
                max: 100 * speedCoef
            },
            scale: { start: scale, end: 0 },
            gravityY: 150,
            blendMode: 'ADD',
            emitting: false
        }).setDepth(1000);

        emitter.explode(10 + Math.random() * 5);

        this.terrainManager.explodeTerrain(cx, cy, radius, minSize);

        this.cameras.main.shake(250, 0.005); // Shake camera

        for (const sessionId in this.playerObjects) {
            const playerObject = this.playerObjects[sessionId];

            playerReactToExplosion(playerObject, cx, cy, radius);
        }
    }

    pointerDownEvent(pointer: Phaser.Input.Pointer) {
        this.shotManager.setTargetPosition(pointer.x, pointer.y);
        this.shotManager.setStartingPosition(this.currentPlayer.x, this.currentPlayer.y);

        this.shotManager.chargeShot();
    }

    pointerUpEvent(pointer: Phaser.Input.Pointer) {
        this.shotManager.setTargetPosition(pointer.x, pointer.y);
        this.shotManager.setStartingPosition(this.currentPlayer.x, this.currentPlayer.y);

        this.shotManager.releaseShot();
    }

    pointerMoveEvent(pointer: Phaser.Input.Pointer) {
        this.shotManager.setTargetPosition(pointer.x, pointer.y);
        this.shotManager.setStartingPosition(this.currentPlayer.x, this.currentPlayer.y);

        this.currentMousePosition = {
            x: pointer.x,
            y: pointer.y
        }
    }
}