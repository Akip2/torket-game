import { TILE_SIZE } from "@shared/const";
import QuadBlock from "@shared/data/QuadBlock";
import TerrainBlock from "src/bodies/TerrainBlock";
import PhysicsManager from "./PhysicsManager";
import { QuadBlockState } from "src/rooms/schema/MyRoomState";
import { ArraySchema } from "@colyseus/schema";


export default class TerrainManager {
    physicsManager: PhysicsManager;
    root: QuadBlock;
    terrainBlocks: TerrainBlock[] = [];

    constructor(physicsManager: PhysicsManager, root: QuadBlock) {
        this.physicsManager = physicsManager;
        this.root = root;
    }

    createTerrain() {
        this.createTerrainBlock(this.root);
    }

    recreateTerrain() {
        this.terrainBlocks.forEach(t => this.physicsManager.remove(t));
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
            this.physicsManager.add(terrainBlock);
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

    quadBlockToState(block: QuadBlock) {
        const state = new QuadBlockState(block.x, block.y, block.width, block.height, block.filled);

        state.children = new ArraySchema(
            ...block.children.map(child => this.quadBlockToState(child))
        );

        return state;
    }

    getQuadBlockState() {
        return this.quadBlockToState(this.root);
    }
}