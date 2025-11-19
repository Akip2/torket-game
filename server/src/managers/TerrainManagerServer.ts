import { TILE_SIZE } from "@shared/const";
import QuadBlock from "@shared/data/QuadBlock";
import TerrainBlock from "src/bodies/TerrainBlock";
import PhysicsManager from "./PhysicsManager";

export default class TerrainManagerServer {
    physicsManager: PhysicsManager;
    root: QuadBlock;
    terrainBlocks: TerrainBlock[] = [];

    constructor(physicsManager: PhysicsManager, root: QuadBlock) {
        this.physicsManager = physicsManager;
        this.root = root;
    }

    createTerrain() {
        const filledBlocks: QuadBlock[] = this.root.getFilledBlocks();

        const mergedRects = QuadBlock.mergeAdjacentBlocks(filledBlocks);

        for (const rect of mergedRects) {
            const terrainBlock = new TerrainBlock(
                rect.x + rect.width / 2,
                rect.y + rect.height / 2,
                rect.width,
                rect.height
            );

            this.terrainBlocks.push(terrainBlock);
            this.physicsManager.add(terrainBlock);
        }
    }

    recreateTerrain() {
        this.terrainBlocks.forEach(t => this.physicsManager.remove(t));
        this.terrainBlocks = [];
        this.createTerrain();
    }

    explodeTerrain(cx: number, cy: number, radius: number, minSize: number = TILE_SIZE) {
        this.root.destroy(cx, cy, radius, minSize);
        this.recreateTerrain();
    }
}