import QuadBlock from "@shared/data/QuadBlock";
import type GameScene from "../scenes/GameScene";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { DEBUG, TEXTURE_SIZE, TILE_SIZE } from "@shared/const";
import type { QuadBlockType } from "@shared/types";
import { Depths } from "@shared/enums/Depths.eunum";

export default class TerrainManager {
    scene: GameScene;
    root: QuadBlock;

    terrainColliders: MatterJS.BodyType[] = [];
    terrainSprites: Phaser.GameObjects.TileSprite[] = [];

    constructor(scene: GameScene, root: QuadBlock = new QuadBlock(0, 0)) {
        this.scene = scene;
        this.root = root;
    }

    explodeTerrain(cx: number, cy: number, radius: number, minSize: number = TILE_SIZE) {
        this.root.destroy(cx, cy, radius, minSize); // Destroy terrain
        this.redrawTerrain();
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

            const sprite = this.scene.add.tileSprite(
                x, y,
                width, height,
                RessourceKeys.Ground
            ).setOrigin(0)
            .setDepth(Depths.Fourth);

            sprite.tilePositionX = block.x % TEXTURE_SIZE;
            sprite.tilePositionY = block.y % TEXTURE_SIZE;

            this.terrainSprites.push(sprite);

            if (DEBUG) {
                const g = this.scene.add.graphics()
                    .lineStyle(1, 0x00ff00)
                    .strokeRect(block.x, block.y, block.width, block.height);
                this.scene.debugGraphics.push(g);
            }
        } else if (block.hasChildren()) {
            for (const child of block.children!) {
                this.drawQuadBlock(child);
            }
        }
    }

    redrawTerrain() {
        this.scene.debugGraphics.forEach(g => g.destroy());
        this.scene.debugGraphics = [];

        this.terrainSprites.forEach(s => s.destroy());
        this.terrainSprites = [];

        this.drawTerrain();

        this.terrainColliders.forEach(c => this.scene.matter.world.remove(c))
        this.createTerrainColliders();
    }

    createTerrainColliders() {
        this.createQuadBlockCollider(this.root);
    }

    createQuadBlockCollider(block: QuadBlock) {
        if (block.isEmpty()) return;

        if (block.filled) {
            const collider = this.scene.matter.add.rectangle(
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

            this.terrainColliders.push(collider);
        } else if (block.hasChildren()) {
            for (const child of block.children) {
                this.createQuadBlockCollider(child);
            }
        }
    }
    
    constructQuadBlock(blockType: QuadBlockType) {
        this.root = QuadBlock.generateQuadBlockFromType(blockType);
    }
}