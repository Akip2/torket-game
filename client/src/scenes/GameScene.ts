import { EXPLOSION_RADIUS, GAME_HEIGHT, GAME_WIDTH, GROUND_TYPE, TEXTURE_SIZE, TILE_SIZE, TIME_STEP } from "@shared/const";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import BulletClient from "../game-objects/BulletClient";
import PlayerClient from "../game-objects/PlayerClient";
import { Client, Room } from "colyseus.js";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import TextureManager from "../managers/TextureManager";
import TerrainManagerClient from "../managers/TerrainManagerClient";
import { getExplosionSpriteScale } from "@shared/utils";
import ShotManager from "../managers/ShotManager";
import PlayerManagerClient from "../managers/PlayerManagerClient";
import { SceneNames } from "@shared/enums/SceneNames.enum";
import type { FullSynchroInfo, InitData, Position } from "@shared/types";
import { Depths } from "@shared/enums/Depths.eunum";
import PhaseManagerClient from "../managers/PhaseManagerClient";
import PhaseDisplayer from "../ui/PhaseDisplayer";
import { TextStyle } from "../ui/ui-styles";
import UiText from "../ui/UiText";
import { canPlayerShoot } from "@shared/logics/player-logic";
import ActionChoicePanel from "../ui/ActionChoicePanel";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "localhost:2567";

export default class GameScene extends Phaser.Scene {
    active: boolean = true;
    client = new Client(`ws://${SERVER_URL}`);
    room!: Room;

    debugGraphics: Phaser.GameObjects.Graphics[] = [];

    elapsedTime = 0;

    keyboard!: Phaser.Types.Input.Keyboard.CursorKeys;

    playerManager!: PlayerManagerClient;

    terrainManager!: TerrainManagerClient;
    shotManager!: ShotManager;
    phaseManager: PhaseManagerClient = new PhaseManagerClient();

    worldContainer!: Phaser.GameObjects.Container;
    uiContainer!: Phaser.GameObjects.Container;

    currentMousePosition: Position = { x: 0, y: 0 }

    initData!: InitData; // data related to the current player, sent to the server on connection

    phaseDisplayer!: PhaseDisplayer;
    actionChoicePanel!: ActionChoicePanel;

    constructor() {
        super(SceneNames.Game);
    }

    init(data: InitData) {
        this.initData = data;
    }

    preload() {
        this.keyboard = this.input.keyboard!.createCursorKeys();
        this.load.image(RessourceKeys.Ground, `assets/ground/${GROUND_TYPE}_${TEXTURE_SIZE}.png`);
        this.load.image(RessourceKeys.Particle, 'assets/explosion/particle.png');
    }

    async create() {
        try {
            await this.setupRoomEvents();
        } catch (e) {
            console.log(e);
            throw e;
        }

        this.worldContainer = this.add.container();
        this.uiContainer = this.add.container();
        this.patchScene()

        new TextureManager(this.add).generateTextures();

        this.terrainManager = new TerrainManagerClient(this);
        this.terrainManager.drawTerrain();
        this.terrainManager.createTerrainColliders();

        this.shotManager = new ShotManager(this);

        this.setupCollisionEvents();
        this.setupPointerEvents();
        this.setupVisibilityHandler();
        this.setupUi();
    }

    async setupRoomEvents() {
        if (!this.room) this.room = await this.client.joinOrCreate("my_room", this.initData);

        this.playerManager = new PlayerManagerClient(this.room);
        this.playerManager.setupPlayerListeners(this);

        this.room.onMessage(RequestTypes.TerrainSynchro, (quadBlock) => {
            this.terrainManager.constructQuadBlock(quadBlock);
            this.terrainManager.redrawTerrain();
        });

        this.room.onMessage(RequestTypes.PhaseSynchro, (phase) => {
            this.phaseManager.setCurrentPhase(phase);

            if (this.phaseManager.isActionChoicePhase() && this.phaseManager.isConcerned(this.room.sessionId)) {
                this.actionChoicePanel.show();
            } else {
                this.actionChoicePanel.hide();
            }
        });

        this.room.onMessage(RequestTypes.FullSynchro, (synchroInfo: FullSynchroInfo) => {
            this.terrainManager.constructQuadBlock(synchroInfo.terrain);
            this.terrainManager.redrawTerrain();

            this.phaseManager.setCurrentPhase(synchroInfo.phase);
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

    setupUi() {
        const uiCam = this.cameras.add(0, 0, GAME_WIDTH, GAME_HEIGHT);
        uiCam.setScroll(0, 0);

        this.cameras.main.ignore(this.uiContainer);
        uiCam.ignore(this.worldContainer);

        this.phaseDisplayer = new PhaseDisplayer(this, this.phaseManager, TextStyle.PhaseDisplayer);
        this.actionChoicePanel = new ActionChoicePanel(this);
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

        this.phaseDisplayer.update();
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
        if (!canPlayerShoot(this.playerManager.currentPlayer)) return;

        this.shotManager.setTargetPosition(pointer.x, pointer.y);
        this.shotManager.setStartingPosition(this.playerManager.currentPlayer.x, this.playerManager.currentPlayer.y);

        this.shotManager.chargeShot();
    }

    pointerUpEvent(pointer: Phaser.Input.Pointer) {
        if (!canPlayerShoot(this.playerManager.currentPlayer)) return;

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

    patchScene() {
        this.add.existing = (gameObject: any) => {
            if (gameObject instanceof UiText) {
                this.uiContainer.add(gameObject);
            }
            else {
                this.worldContainer.add(gameObject);
            }
            return gameObject;
        };

        const originalGraphics = this.add.graphics;
        this.add.graphics = (...args) => {
            const g = originalGraphics.apply(this.add, args);
            this.worldContainer.add(g);
            return g;
        };

        const originalRectangle = this.add.rectangle;
        this.add.rectangle = (...args) => {
            const rect = originalRectangle.apply(this.add, args);
            this.worldContainer.add(rect);
            return rect;
        }
    }
}