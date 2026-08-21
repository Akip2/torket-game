import { TILE_SIZE } from "@shared/const";
import QuadBlock from "@shared/data/QuadBlock";
import TerrainBlock from "../bodies/TerrainBlock";
import PhysicsManager from "./PhysicsManager";
import BulletServer from "../bodies/BulletServer";
import { Bounds } from "@shared/types";
import { generateBorderData } from "@shared/utils";
import SimulationBorderServer from "../bodies/SimulationBorderServer";

export default class TerrainManagerServer {
    physicsManager: PhysicsManager;
    root: QuadBlock;
    terrainBlocks: TerrainBlock[] = [];
    bounds: Bounds;

    constructor(physicsManager: PhysicsManager, root: QuadBlock, bounds: Bounds) {
        this.physicsManager = physicsManager;
        this.root = root;
        this.bounds = bounds;
    }

    createEnvironment() {
        this.createTerrain();
        this.createBorders();
    }

    createBorders() {
        const borders = generateBorderData(this.bounds);

        for (let i = 0; i < borders.length; i++) {
            const isBottom = i === borders.length - 1;
            const border = borders[i];

            this.physicsManager.add(
                new SimulationBorderServer(
                    border.x,
                    border.y,
                    border.width,
                    border.height,
                    isBottom
                )
            );
        }
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