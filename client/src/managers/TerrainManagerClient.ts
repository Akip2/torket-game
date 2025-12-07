import QuadBlock from "@shared/data/QuadBlock";
import type GameScene from "../scenes/GameScene";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { DEBUG, TEXTURE_SIZE, TILE_SIZE } from "@shared/const";
import type { QuadBlockType } from "@shared/types";
import { Depths } from "@shared/enums/Depths.eunum";
import BlockSprite from "../game-objects/BlockSprite";

export default class TerrainManagerClient {
    scene: GameScene;
    root: QuadBlock;
    terrainColliders: MatterJS.BodyType[] = [];
    terrainSprites: Phaser.GameObjects.TileSprite[] = [];

    spritePool: Phaser.GameObjects.TileSprite[] = [];

    constructor(scene: GameScene, root: QuadBlock = new QuadBlock(0, 0)) {
        this.scene = scene;
        this.root = root;
    }

    explodeTerrain(
        cx: number,
        cy: number,
        radius: number,
        minSize: number = TILE_SIZE
    ) {
        this.root.destroy(cx, cy, radius, minSize);
        this.root.cleanup();
        this.redrawTerrain();
    }

    drawTerrain() {
        this.drawQuadBlock(this.root);
    }

    drawQuadBlock(block: QuadBlock) {
        if (block.isEmpty()) return;

        if (block.filled) {
            let sprite = this.spritePool.pop();

            if (sprite) {
                sprite.setPosition(block.x, block.y);
                sprite.setSize(block.width, block.height);
                sprite.setVisible(true);
                sprite.tilePositionX = block.x % TEXTURE_SIZE;
                sprite.tilePositionY = block.y % TEXTURE_SIZE;
            } else {
                sprite = new BlockSprite(this.scene, block.x, block.y, block.width, block.height, block.x % TEXTURE_SIZE, block.y % TEXTURE_SIZE);
            }

            this.terrainSprites.push(sprite);

        } else if (block.hasChildren()) {
            for (let i = 0; i < block.children.length; i++) {
                this.drawQuadBlock(block.children[i]);
            }
        }
    }

    redrawTerrain() {
        if (DEBUG) {
            for (let i = 0; i < this.scene.debugGraphics.length; i++) {
                this.scene.debugGraphics[i].destroy();
            }
            this.scene.debugGraphics = [];
        }

        for (let i = 0; i < this.terrainSprites.length; i++) {
            const sprite = this.terrainSprites[i];
            sprite.setVisible(false);
            this.spritePool.push(sprite);
        }
        this.terrainSprites = [];

        this.drawTerrain();
        this.recreateColliders();
    }

    private recreateColliders() {
        if (this.terrainColliders.length > 0) {
            this.scene.matter.world.remove(this.terrainColliders);
            this.terrainColliders = [];
        }

        this.createTerrainColliders();
    }

    createTerrainColliders() {
        const filledBlocks: QuadBlock[] = this.root.getFilledBlocks();

        const mergedRects = QuadBlock.mergeAdjacentBlocks(filledBlocks);

        for (let i = 0; i < mergedRects.length; i++) {
            const rect = mergedRects[i];
            const collider = this.scene.matter.add.rectangle(
                rect.x + rect.width / 2,
                rect.y + rect.height / 2,
                rect.width,
                rect.height,
                {
                    isStatic: true,
                    friction: 0,
                    frictionAir: 0,
                    frictionStatic: 0,
                    label: RessourceKeys.Ground,
                }
            );
            this.terrainColliders.push(collider);

            if (DEBUG) {
                const g = this.scene.add
                    .graphics()
                    .lineStyle(1, 0x00ff00)
                    .strokeRect(rect.x, rect.y, rect.width, rect.height)
                    .setDepth(Depths.Debug);
                this.scene.debugGraphics.push(g);
            }
        }
    }

    constructQuadBlock(blockType: QuadBlockType) {
        this.root = QuadBlock.generateQuadBlockFromType(blockType);
    }
}