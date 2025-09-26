import { TILE_SIZE } from "@shared/const";
import QuadBlock from "@shared/data/QuadBlock";
import { Engine } from "matter-js";
import TerrainBlock from "src/bodies/TerrainBlock";

export default class TerrainManager {
    engine: Engine;
    root: QuadBlock;
    terrainBlocks: TerrainBlock[] = [];

    constructor(engine: Engine, root: QuadBlock) {
        this.engine = engine;
        this.root = root;
    }

    createTerrain() {
        this.createTerrainBlock(this.root);
    }

    recreateTerrain() {
        this.terrainBlocks.forEach(t => t.removeFromWorld(this.engine.world));
        this.terrainBlocks = [];
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

    explodeTerrain(cx: number, cy: number, radius: number, minSize: number = TILE_SIZE) {
        this.root.destroy(cx, cy, radius, minSize);
        this.recreateTerrain();
    }
}