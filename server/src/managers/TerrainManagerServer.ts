import { TILE_SIZE } from "@shared/const";
import QuadBlock from "@shared/data/QuadBlock";
import TerrainBlock from "../bodies/TerrainBlock";
import PhysicsManager from "./PhysicsManager";
import BulletServer from "../bodies/BulletServer";

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
        this.terrainBlocks.forEach(t => t.removeFromWorld());
        this.terrainBlocks = [];
        this.createTerrain();
    }

    explodeTerrain(bullet: BulletServer, minSize: number = TILE_SIZE) {
        const { x, y } = bullet.getPosition();
        const explosionSize = bullet.getExplosionInfo().explosionSize;

        this.root.destroy(x, y, explosionSize, minSize);
        this.recreateTerrain();
    }
}