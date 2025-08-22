import { DEBUG, EXPLOSION_RADIUS, GAME_HEIGHT, GAME_WIDTH, TEXTURE_SIZE, TILE_SIZE } from "../const";
import QuadBlock from "../data/QuadBlock";
import { getExplosionSpriteScale } from "../utils";

export default abstract class GameScene extends Phaser.Scene {
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    root: QuadBlock;
    debugGraphics: Phaser.GameObjects.Graphics[] = [];
    terrainColliders!: Phaser.Physics.Arcade.StaticGroup;
    terrainSprites: Phaser.GameObjects.TileSprite[] = [];

    constructor(name: string) {
        super(name);

        this.root = new QuadBlock(
            0,
            GAME_HEIGHT - GAME_HEIGHT / 5,
            GAME_WIDTH,
            GAME_HEIGHT / 5,
        );
    }

    preload() {
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.load.image('ground', `assets/ground/ground_${TEXTURE_SIZE}.png`);
        this.load.image('particle', 'assets/explosion/particle.png');

        this.loadAdditionalRessources();
    }

    create() {
        this.generatePlayerTexture();
        this.player = this.addPlayer();

        this.terrainColliders = this.physics.add.staticGroup();
        this.physics.add.collider(this.player, this.terrainColliders);

        this.drawTerrain();
        this.createTerrainColliders();

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.clickEvent(pointer));
    }

    update() {
        this.checkPlayerMovements();
        this.sceneLogic();
    }

    clickEvent(pointer: Phaser.Input.Pointer) {
        const startDate = new Date();

        const x = pointer.x;
        const y = pointer.y;

        this.explodeTerrain(x, y, EXPLOSION_RADIUS, TILE_SIZE);

        this.redrawTerrain();

        const endDate = new Date();
        console.log((endDate.getTime() - startDate.getTime()) / 1000);

        if (DEBUG) {
            const g = this.add.graphics();
            g.clear();
            g.lineStyle(2, 0xffff00);
            g.strokeCircle(x, y, EXPLOSION_RADIUS);
            this.debugGraphics.push(g);
        }
    }

    generatePlayerTexture(size = 64, baseColor = 0x3498db) {
        const g = this.add.graphics();

        g.fillStyle(baseColor, 1);
        g.fillRect(0, 0, size, size);

        g.lineStyle(size / 4, 0x21618c, 1);
        g.strokeRect(0, 0, size, size);

        g.generateTexture('playerTexture', size, size);
        g.destroy();
    }

    placePlayer(x: number, y: number) {
        return this.physics.add.sprite(
            x,
            y,
            'playerTexture'
        ).setScale(0.5); // ajuste la taille si besoin
    }

    checkPlayerMovements() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
        }
        else {
            this.player.setVelocityX(0);
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-375);
        }
    }

    explodeTerrain(cx: number, cy: number, radius: number, minSize: number = TILE_SIZE) {
        //Explosion particles
        const scale = getExplosionSpriteScale(radius);
        const speedCoef = Math.max(scale * 0.5, 1);

        const emitter = this.add.particles(cx, cy, 'particle', {
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

        this.root.destroy(cx, cy, radius, minSize);

        this.cameras.main.shake(250, 0.005);
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
                'ground'
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

        this.terrainColliders.clear(true, true);
        this.createTerrainColliders();
    }

    createTerrainColliders() {
        this.createQuadBlockCollider(this.root);
    }

    createQuadBlockCollider(block: QuadBlock) {
        if (block.isEmpty()) return;

        if (block.filled) {
            const collider = this.add.rectangle(
                block.x + block.width / 2,
                block.y + block.height / 2,
                block.width,
                block.height
            );

            this.physics.add.existing(collider, true);
            this.terrainColliders.add(collider);
        } else if (block.hasChildren()) {
            for (const child of block.children) {
                this.createQuadBlockCollider(child);
            }
        }
    }

    abstract addPlayer(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    loadAdditionalRessources() { }

    sceneLogic() { }
}
