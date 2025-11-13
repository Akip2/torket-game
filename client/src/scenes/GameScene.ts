import { EXPLOSION_RADIUS, TEXTURE_SIZE, TILE_SIZE, TIME_STEP } from "@shared/const";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import BulletClient from "../game-objects/BulletClient";
import PlayerClient from "../game-objects/PlayerClient";
import { Client, Room } from "colyseus.js";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import TextureManager from "../managers/TextureManager";
import TerrainManager from "../managers/TerrainManager";
import { getExplosionSpriteScale } from "@shared/utils";
import ShotManager from "../managers/ShotManager";
import PlayerManager from "../managers/PlayerManager";
import { SceneNames } from "@shared/enums/SceneNames.enum";
import type { InitData, Position } from "@shared/types";
import { Depths } from "@shared/enums/Depths.eunum";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "localhost:2567";

export default class GameScene extends Phaser.Scene {
    active: boolean = true;
    client = new Client(`ws://${SERVER_URL}`);
    room!: Room;

    debugGraphics: Phaser.GameObjects.Graphics[] = [];

    elapsedTime = 0;

    keyboard!: Phaser.Types.Input.Keyboard.CursorKeys;

    playerManager!: PlayerManager;

    terrainManager!: TerrainManager;
    shotManager!: ShotManager;

    currentMousePosition: Position = { x: 0, y: 0 }

    initData!: InitData; // data related to the current player, sent to the server on connection

    constructor() {
        super(SceneNames.Game);
    }

    init(data: InitData) {
        this.initData = data;
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

        this.terrainManager = new TerrainManager(this);
        this.terrainManager.drawTerrain();
        this.terrainManager.createTerrainColliders();

        this.shotManager = new ShotManager(this);

        this.setupCollisionEvents();
        this.setupPointerEvents();
        this.setupVisibilityHandler();
    }

    async setupRoomEvents() {
        if (!this.room) this.room = await this.client.joinOrCreate("my_room", this.initData);

        this.playerManager = new PlayerManager(this.room);
        this.playerManager.setupPlayerListeners(this);

        this.room.onMessage(RequestTypes.TerrainSynchro, (quadBlock) => {
            this.terrainManager.constructQuadBlock(quadBlock);
            this.terrainManager.redrawTerrain();
        });

        this.room.onMessage(RequestTypes.Shoot, (shootInfo) => {
            if (this.active) this.shotManager.shootBulletFromInfo(shootInfo);
        });

        this.room.onMessage(RequestTypes.HealthUpdate, (healthUpdateInfo) => {
            const playerObject = this.playerManager.getPlayer(healthUpdateInfo.playerId);
            playerObject.hp = healthUpdateInfo.hp;

            if (playerObject.hp <= 0) {
                playerObject.isAlive = false;
            }
        });
    }

    setupPointerEvents() {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.pointerDownEvent(pointer));
        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => this.pointerUpEvent(pointer));
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.pointerMoveEvent(pointer));
    }

    setupVisibilityHandler() {
        document.addEventListener("visibilitychange", async () => {
            if (document.hidden) {
                this.active = false;
            } else {
                this.active = true;
                this.room.send(RequestTypes.TerrainSynchro);
            }
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

        this.playerManager.localInputBuffer.push(inputPayload);
        this.room.send(RequestTypes.Move, inputPayload);

        this.playerManager.handleLocalInput(inputPayload, this.currentMousePosition);
        this.playerManager.updatePlayers();
    }

    update(_time: number, delta: number): void {
        if (!this.playerManager || !this.playerManager.currentPlayer) { return; }

        this.elapsedTime += delta;

        while (this.elapsedTime >= TIME_STEP) {
            this.elapsedTime -= TIME_STEP;
            this.fixedTick();
        }
    }

    setupCollisionEvents() {
        this.matter.world.on("collisionstart", (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
            for (const { bodyA, bodyB, collision } of event.pairs) {
                const labels = [bodyA.label, bodyB.label];

                if (labels.includes(RessourceKeys.Bullet) && (labels.includes(RessourceKeys.Ground) || labels.includes(RessourceKeys.Player))) {
                    const bullet = (bodyA.label === RessourceKeys.Bullet) ? bodyA.gameObject as BulletClient : bodyB.gameObject as BulletClient;

                    if (bullet) {
                        this.explode(bullet.x, bullet.y, EXPLOSION_RADIUS);
                        bullet.destroy();
                    }
                }

                if (labels.includes(RessourceKeys.Player) && labels.includes(RessourceKeys.Ground)) {
                    const normal = bodyA.label === RessourceKeys.Player ? collision.normal : { x: -collision.normal.x, y: -collision.normal.y };
                    if (normal.y < -0.3) {
                        const player = (bodyA.label === RessourceKeys.Player ? bodyA.gameObject : bodyB.gameObject) as PlayerClient;
                        player.isOnGround = true;
                    }
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
        }).setDepth(Depths.First);

        emitter.explode(10 + Math.random() * 5);

        this.terrainManager.explodeTerrain(cx, cy, radius, minSize);

        this.cameras.main.shake(250, 0.005); // Shake camera

        this.playerManager.reactToExplosion(cx, cy, radius);
    }

    pointerDownEvent(pointer: Phaser.Input.Pointer) {
        this.shotManager.setTargetPosition(pointer.x, pointer.y);
        this.shotManager.setStartingPosition(this.playerManager.currentPlayer.x, this.playerManager.currentPlayer.y);

        this.shotManager.chargeShot();
    }

    pointerUpEvent(pointer: Phaser.Input.Pointer) {
        this.shotManager.setTargetPosition(pointer.x, pointer.y);
        this.shotManager.setStartingPosition(this.playerManager.currentPlayer.x, this.playerManager.currentPlayer.y);

        this.shotManager.releaseShot();
    }

    pointerMoveEvent(pointer: Phaser.Input.Pointer) {
        this.shotManager.setTargetPosition(pointer.x, pointer.y);
        this.shotManager.setStartingPosition(this.playerManager.currentPlayer.x, this.playerManager.currentPlayer.y);

        this.currentMousePosition = {
            x: pointer.x,
            y: pointer.y
        }
    }
}