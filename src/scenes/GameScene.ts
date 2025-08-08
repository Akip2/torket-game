import { DEBUG, EXPLOSION_RADIUS, GAME_HEIGHT, GAME_WIDTH, TEXTURE_SIZE, TILE_SIZE } from "../const";
import QuadBlock from "../data/QuadBlock";

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
        this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 48 });

        this.loadAdditionalRessources();
    }

    create() {
        this.player = this.addPlayer();

        this.terrainColliders = this.physics.add.staticGroup();
        this.physics.add.collider(this.player, this.terrainColliders);

        this.setUpPlayerAnimations();

        this.drawTerrain();
        this.createTerrainColliders();

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            var startDate = new Date();

            const x = pointer.x;
            const y = pointer.y;

            this.destroyTerrain(x, y, EXPLOSION_RADIUS, TILE_SIZE);
            this.redrawTerrain();

            var endDate = new Date();
            console.log((endDate.getTime() - startDate.getTime()) / 1000);

            if (DEBUG) {
                const g = this.add.graphics();
                g.clear();
                g.lineStyle(2, 0xffff00);
                g.strokeCircle(x, y, EXPLOSION_RADIUS);
                this.debugGraphics.push(g);
            }
        });
    }

    update() {
        this.checkPlayerMovements();
        this.sceneLogic();
    }

    setUpPlayerAnimations() {
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{ key: 'player', frame: 4 }],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });
    }

    placePlayer(x: number, y: number) {
        return this.physics.add.sprite(
            x,
            y,
            'player'
        );
    }

    checkPlayerMovements() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);

            this.player.anims.play('right', true);
        }
        else {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }

        if (this.cursors.up.isDown && this.player.body.touching.down) {
            this.player.setVelocityY(-375);
        }
    }

    destroyTerrain(cx: number, cy: number, radius: number, minSize: number = TILE_SIZE) {
        this.root.destroy(cx, cy, radius, minSize);
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