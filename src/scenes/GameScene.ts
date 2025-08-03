import { EXPLOSION_RADIUS, GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from "../const";
import type { QuadBlock } from "../types";

export default abstract class GameScene extends Phaser.Scene {
    cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    renderTexture!: Phaser.GameObjects.RenderTexture;
    root: QuadBlock;
    debugGraphics: Phaser.GameObjects.Graphics[] = [];

    constructor(name: string) {
        super(name);

        this.root = {
            x: 0,
            y: GAME_HEIGHT - GAME_HEIGHT / 5,
            width: GAME_WIDTH,
            height: GAME_HEIGHT / 5,
            filled: true
        };
    }

    debugDraw(display: Phaser.GameObjects.Graphics) {
        this.debugGraphics.push(display);
    }

    preload() {
        this.cursors = this.input.keyboard!.createCursorKeys();
        this.load.image('ground', `assets/ground_${TILE_SIZE}.png`);
        this.load.spritesheet('player', 'assets/player.png', { frameWidth: 32, frameHeight: 48 });

        this.loadAdditionalRessources();
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

    create() {
        const staticGroup = this.physics.add.staticGroup();
        this.player = this.addPlayer();
        this.renderTexture = this.add.renderTexture(0, 0, GAME_WIDTH, GAME_HEIGHT).setOrigin(0);

        this.setUpPlayerAnimations();
        this.addStaticPlatforms(staticGroup);

        this.physics.add.collider(this.player, staticGroup);

        this.drawTerrain(this.root);

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            var startDate = new Date();

            const x = pointer.x;
            const y = pointer.y;

            this.destroyTerrain(this.root, x, y, EXPLOSION_RADIUS, TILE_SIZE);
            this.redrawTerrain();

            var endDate = new Date();
            console.log((endDate.getTime() - startDate.getTime()) / 1000);

            const g = this.add.graphics();
            g.clear();
            g.lineStyle(2, 0xffff00);
            g.strokeCircle(x, y, EXPLOSION_RADIUS);
            this.debugGraphics.push(g);

            this.highlightTouchedBlocks(this.root, x, y, EXPLOSION_RADIUS);
        });
    }

    createGround(heightInTiles: number) {
        const groundHeight = heightInTiles * TILE_SIZE;
        const airHeight = GAME_HEIGHT - groundHeight;

        this.root.children = [
            {
                x: 0,
                y: 0,
                width: GAME_WIDTH,
                height: airHeight,
                filled: false,
            },
            {
                x: 0,
                y: airHeight,
                width: GAME_WIDTH,
                height: groundHeight,
                filled: true,
            }
        ];

        this.root.filled = false;
    }

    highlightTouchedBlocks(block: QuadBlock, cx: number, cy: number, radius: number) {
        const circle = new Phaser.Geom.Circle(cx, cy, radius);
        const rect = new Phaser.Geom.Rectangle(block.x, block.y, block.width, block.height);

        // Si le bloc est hors du cercle, on ignore
        if (!Phaser.Geom.Intersects.CircleToRectangle(circle, rect)) return;

        // Si c'est une feuille remplie (bloc final), on dessine le rectangle en rouge
        if (block.filled && !block.children) {
            const g = this.add.graphics()
                .lineStyle(2, 0xff0000)
                .strokeRect(block.x, block.y, block.width, block.height);

            this.debugGraphics.push(g);
            return;
        }

        // Sinon, on explore les enfants
        if (block.children) {
            for (const child of block.children) {
                this.highlightTouchedBlocks(child, cx, cy, radius);
            }
        }
    }

    placePlayer(x: number, y: number) {
        return this.physics.add.sprite(
            x,
            y,
            'player'
        );
    }

    abstract addStaticPlatforms(staticGroup: Phaser.Physics.Arcade.StaticGroup): void;

    abstract addPlayer(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

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

    update(): void {
        this.checkPlayerMovements();
        this.sceneLogic();
    }

    addPlatformBlock(
        group: Phaser.GameObjects.Group,
        startCol: number,
        endCol: number,
        startRow: number,
        endRow: number
    ) {
        for (let row = startRow; row < endRow; row++) {
            for (let col = startCol; col < endCol; col++) {
                const x = (col * TILE_SIZE);
                const y = GAME_HEIGHT - ((row + 1) * TILE_SIZE);

                this.renderTexture.draw("ground", x, y);
            }
        }
    }

    normalize(n: number, m: number) {
        return n - (n % m);
    }

    subdivide(block: QuadBlock, minSize = TILE_SIZE) {
        if (block.width <= minSize || block.height <= minSize) return;

        const aspectRatio = block.width / block.height;

        // Si très large → subdivision horizontale
        if (aspectRatio > 2) {
            const midX = block.x + block.width / 2;
            const hw = block.width / 2;

            block.children = [
                { x: block.x, y: block.y, width: hw, height: block.height, filled: block.filled},
                { x: midX, y: block.y, width: hw, height: block.height, filled: block.filled },
            ];
        }
        // Si très haut → subdivision verticale
        else if (aspectRatio < 0.5) {
            const midY = block.y + block.height / 2;
            const hh = block.height / 2;

            block.children = [
                { x: block.x, y: block.y, width: block.width, height: hh, filled: block.filled },
                { x: block.x, y: midY, width: block.width, height: hh, filled: block.filled },
            ];
        }
        // Sinon, subdivision classique en 4
        else {
            const hw = block.width / 2;
            const hh = block.height / 2;

            block.children = [
                { x: block.x, y: block.y, width: hw, height: hh, filled: block.filled },
                { x: block.x + hw, y: block.y, width: hw, height: hh, filled: block.filled},
                { x: block.x, y: block.y + hh, width: hw, height: hh, filled: block.filled  },
                { x: block.x + hw, y: block.y + hh, width: hw, height: hh, filled: block.filled  },
            ];
        }

        block.filled = false;
    }

    destroyTerrain(block: QuadBlock, cx: number, cy: number, radius: number, minSize: number = TILE_SIZE) {
        const rect = new Phaser.Geom.Rectangle(block.x, block.y, block.width, block.height);
        const circle = new Phaser.Geom.Circle(cx, cy, radius);

        if (!Phaser.Geom.Intersects.CircleToRectangle(circle, rect)) return;

        if (block.width <= minSize || block.height <= minSize) {
            block.filled = false;
            block.children = [];
            return;
        }

        if (!block.children) {
            this.subdivide(block, minSize);
        }

        if (block.children) {
            for (const child of block.children) {
                this.destroyTerrain(child, cx, cy, radius, minSize);
            }
        }
    }


    redrawTerrain() {
        this.debugGraphics.forEach(g => g.destroy());
        this.debugGraphics = [];

        this.renderTexture.clear();
        this.drawTerrain(this.root);
    }

    drawTerrain(block: QuadBlock) {
        if (!block.filled && !block.children) return;

        if (block.filled) {
            for (let currentY = block.y; currentY < block.y + block.height; currentY += TILE_SIZE) {
                for (let currentX = block.x; currentX < block.x + block.width; currentX += TILE_SIZE) {
                    this.renderTexture.draw("ground", currentX, currentY);
                    const g = this.add.graphics()
                        .lineStyle(1, 0xff0000)
                        .strokeRect(block.x, block.y, block.width, block.height);

                    this.debugGraphics.push(g);
                }
            }
        } else if (block.children) {
            for (const child of block.children!) {
                this.drawTerrain(child);
            }
        }
    }

    loadAdditionalRessources() {

    }

    sceneLogic() {

    }
}