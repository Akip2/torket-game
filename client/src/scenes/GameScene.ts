import { DEBUG, EXPLOSION_RADIUS, GAME_HEIGHT, GAME_WIDTH, TEXTURE_SIZE, TILE_SIZE } from "../../../shared/const";
import { RessourceKeys } from "../../../shared/enums/RessourceKeys.enum";
import Bullet from "../game-objects/Bullet";
import Player from "../game-objects/Player";
import { Client, Room, getStateCallbacks } from "colyseus.js";
import { getExplosionSpriteScale } from "../../../shared/utils";
import QuadBlock from "../../../shared/data/QuadBlock";
import type { InputPayload } from "../../../shared/types";

export default abstract class GameScene extends Phaser.Scene {
    localInputBuffer: InputPayload[] = [];
    client = new Client("ws://localhost:2567");
    playerObjects: { [sessionId: string]: Player } = {};
    room!: Room;

    keyboard!: Phaser.Types.Input.Keyboard.CursorKeys;

    currentPlayer!: Player;
    remoteRef!: Phaser.GameObjects.Rectangle;
    startingX: number;
    startingY: number;

    root: QuadBlock;
    terrainColliders: MatterJS.BodyType[] = [];
    terrainSprites: Phaser.GameObjects.TileSprite[] = [];

    debugGraphics: Phaser.GameObjects.Graphics[] = [];

    elapsedTime = 0;
    fixedTimeStep = 1000 / 60;

     constructor(name: string, startingX: number, startingY: number) {
        super(name);
        this.startingX = startingX;
        this.startingY = startingY;
        this.root = new QuadBlock(
            0,
            GAME_HEIGHT - GAME_HEIGHT / 5,
            GAME_WIDTH,
            GAME_HEIGHT / 5,
        );
    }

    preload() {
        this.keyboard = this.input.keyboard!.createCursorKeys();
        this.load.image(RessourceKeys.Ground, `assets/ground/ground_${TEXTURE_SIZE}.png`);
        this.load.image(RessourceKeys.Particle, 'assets/explosion/particle.png');
        this.loadAdditionalRessources();
    }

    async create() {
        try {
            this.room = await this.client.joinOrCreate("my_room");
            const $ = getStateCallbacks(this.room);

            $(this.room.state).players.onAdd((player: any, sessionId: string) => {
                const playerObject = new Player(this, player.x, player.y);
                this.playerObjects[sessionId] = playerObject;

                if (sessionId === this.room.sessionId) {
                    this.currentPlayer = playerObject;
                    this.remoteRef = this.add.rectangle(0, 0, playerObject.width, playerObject.height);
                    this.remoteRef.setStrokeStyle(1, 0xff0000);

                    $(player).onChange(() => {
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
                                this.currentPlayer.checkForMovements(input, true);
                            }
                        }
                        this.remoteRef.x = serverX;
                        this.remoteRef.y = serverY;
                    });
                } else {
                    $(player).onChange(() => {
                        playerObject.setData("serverX", player.x);
                        playerObject.setData("serverY", player.y);
                    });
                }
            });

            $(this.room.state).players.onRemove((_player: any, sessionId: string) => {
                this.playerObjects[sessionId].destroy();
                delete this.playerObjects[sessionId];
            });

        } catch (e) {
            console.error(e);
        }

        this.generateTextures();
        this.drawTerrain();
        this.createTerrainColliders();
        this.setupCollisionEvents();

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.clickEvent(pointer));
    }

    fixedTick() {
        if (!this.room) { return; }

        const inputPayload = {
            left: this.keyboard.left.isDown,
            right: this.keyboard.right.isDown,
            up: this.keyboard.up.isDown,
            down: this.keyboard.down.isDown,
            timeStamp: Date.now()
        };

        this.room.send("move", inputPayload);
        this.localInputBuffer.push(inputPayload);

        this.currentPlayer?.checkForMovements(inputPayload);

        for (const sessionId in this.playerObjects) {
            if (sessionId === this.room.sessionId) continue;
            const playerObject = this.playerObjects[sessionId];
            const { serverX, serverY } = playerObject.data.values;
            playerObject.x = Phaser.Math.Linear(playerObject.x, serverX, 0.175);
            playerObject.y = Phaser.Math.Linear(playerObject.y, serverY, 0.35);
        }
    }

    update(time: number, delta: number): void {
        if (!this.currentPlayer) { return; }
        this.elapsedTime += delta;
        while (this.elapsedTime >= this.fixedTimeStep) {
            this.elapsedTime -= this.fixedTimeStep;
            this.fixedTick();
        }
    }

    setupCollisionEvents() {
        this.matter.world.on("collisionstart", (event: Phaser.Physics.Matter.Events.CollisionStartEvent) => {
            for (const { bodyA, bodyB } of event.pairs) {
                const labels = [bodyA.label, bodyB.label];

                if (labels.includes(RessourceKeys.Bullet) && labels.includes(RessourceKeys.Ground)) {
                    const bullet = (bodyA.label === RessourceKeys.Bullet ? bodyA.gameObject : bodyB.gameObject) as Bullet;

                    if (bullet) {
                        this.explodeTerrain(bullet.x, bullet.y, EXPLOSION_RADIUS);
                        bullet.destroy();
                    }
                }

                if (labels.includes(RessourceKeys.Player) && labels.includes(RessourceKeys.Ground)) {
                    const player = (bodyA.label === RessourceKeys.Player ? bodyA.gameObject : bodyB.gameObject) as Player;
                    player.isOnGround = true;
                }
            }
        });
    }

    generateTextures() {
        this.generatePlayerTexture();
        this.generateBulletTexture();
    }

    generatePlayerTexture(size = 32, baseColor = 0x3498db) {
        const g = this.add.graphics();

        g.fillStyle(baseColor, 1);
        g.fillRect(0, 0, size, size);

        g.lineStyle(size / 4, 0x21618c, 1);
        g.strokeRect(0, 0, size, size);

        g.generateTexture(RessourceKeys.Player, size, size);
        g.destroy();
    }

    generateBulletTexture(size = 4) {
        const g = this.add.graphics();

        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(size, size, size);

        g.generateTexture(RessourceKeys.Bullet, size * 2, size * 2);
        g.destroy();
    }

    clickEvent(pointer: Phaser.Input.Pointer) {
        const x = pointer.x;
        const y = pointer.y;

        const bullet = new Bullet(this, this.currentPlayer.x, this.currentPlayer.y);
        bullet.shoot(x, y, 20);
    }

    explodeTerrain(cx: number, cy: number, radius: number, minSize: number = TILE_SIZE) {
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

        this.root.destroy(cx, cy, radius, minSize); // Destroy terrain

        this.redrawTerrain();

        this.cameras.main.shake(250, 0.005); // Shake camera

        this.currentPlayer.push(cx, cy, radius); // Push back player
    }

    drawTerrain() {
        this.drawQuadBlock(this.root);
    }

    drawQuadBlock(block: QuadBlock) {
        if (block.isEmpty()) return;

        if (block.filled) {
            const x = block.x;
            const y = block.y;
            const width = block.width;
            const height = block.height;

            const sprite = this.add.tileSprite(
                x, y,
                width, height,
                RessourceKeys.Ground
            ).setOrigin(0);

            sprite.tilePositionX = block.x % TEXTURE_SIZE;
            sprite.tilePositionY = block.y % TEXTURE_SIZE;

            this.terrainSprites.push(sprite);

            if (DEBUG) {
                const g = this.add.graphics()
                    .lineStyle(1, 0x00ff00)
                    .strokeRect(block.x, block.y, block.width, block.height);
                this.debugGraphics.push(g);
            }
        } else if (block.hasChildren()) {
            for (const child of block.children!) {
                this.drawQuadBlock(child);
            }
        }
    }

    redrawTerrain() {
        this.debugGraphics.forEach(g => g.destroy());
        this.debugGraphics = [];

        this.terrainSprites.forEach(s => s.destroy());
        this.terrainSprites = [];

        this.drawTerrain();

        this.terrainColliders.forEach(c => this.matter.world.remove(c))
        this.createTerrainColliders();
    }

    createTerrainColliders() {
        this.createQuadBlockCollider(this.root);
    }

    createQuadBlockCollider(block: QuadBlock) {
        if (block.isEmpty()) return;

        if (block.filled) {
            const collider = this.matter.add.rectangle(
                block.x + block.width / 2,
                block.y + block.height / 2,
                block.width,
                block.height,
                {
                    isStatic: true,
                    friction: 0,
                    frictionAir: 0,
                    frictionStatic: 0,
                    label: RessourceKeys.Ground
                }
            );

            //this.physics.add.existing(collider, true);
            this.terrainColliders.push(collider);
        } else if (block.hasChildren()) {
            for (const child of block.children) {
                this.createQuadBlockCollider(child);
            }
        }
    }

    loadAdditionalRessources() { }

    sceneLogic() { }
}
