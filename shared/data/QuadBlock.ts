import type { QuadBlockType } from "@shared/types";
import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from "../const";
import { circleIntersectsRectangle } from "../utils";

export default class QuadBlock {
    x: number;
    y: number;
    width: number;
    height: number;
    filled: boolean;
    children: QuadBlock[];

    constructor(
        x: number,
        y: number,
        width: number = GAME_WIDTH,
        height: number = GAME_HEIGHT,
        filled: boolean = true,
        children: QuadBlock[] = []
    ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.filled = filled;
        this.children = children;
    }

    static generateQuadBlockFromType(blockType: QuadBlockType): QuadBlock {
        return new QuadBlock(
            blockType.x,
            blockType.y,
            blockType.width,
            blockType.height,
            blockType.filled,
            blockType.children.map((child) => QuadBlock.generateQuadBlockFromType(child))
        );
    }

    private roundToTileMultiple(value: number, minSize: number): number {
        return Math.round(value / minSize) * minSize;
    }

    subdivideEqually(minSize = TILE_SIZE) {
        const hw = this.roundToTileMultiple(this.width / 2, minSize);
        const hh = this.roundToTileMultiple(this.height / 2, minSize);

        const rightW = this.width - hw;
        const bottomH = this.height - hh;

        this.children = [
            new QuadBlock(this.x, this.y, hw, hh),
            new QuadBlock(this.x + hw, this.y, rightW, hh),
            new QuadBlock(this.x, this.y + hh, hw, bottomH),
            new QuadBlock(this.x + hw, this.y + hh, rightW, bottomH),
        ];
    }

    subdivideHorizontally(minSize = TILE_SIZE) {
        const hw = this.roundToTileMultiple(this.width / 2, minSize);
        const rightW = this.width - hw;
        const midX = this.x + hw;

        this.children = [
            new QuadBlock(this.x, this.y, hw, this.height),
            new QuadBlock(midX, this.y, rightW, this.height),
        ];
    }

    subdivideVertically(minSize = TILE_SIZE) {
        const hh = this.roundToTileMultiple(this.height / 2, minSize);
        const bottomH = this.height - hh;
        const midY = this.y + hh;

        this.children = [
            new QuadBlock(this.x, this.y, this.width, hh),
            new QuadBlock(this.x, midY, this.width, bottomH),
        ];
    }

    subdivideToSquare(minSize = TILE_SIZE) {
        if (this.width > this.height && this.width / 2 >= minSize) {
            this.subdivideHorizontally(minSize);
        } else if (this.height > this.width && this.height / 2 >= minSize) {
            this.subdivideVertically(minSize);
        } else {
            this.subdivideEqually(minSize);
        }
    }

    subdivide(minSize = TILE_SIZE) {
        if (this.width <= minSize || this.height <= minSize) return;

        if (this.width !== this.height) {
            this.subdivideToSquare(minSize);
        } else {
            this.subdivideEqually(minSize);
        }

        this.filled = false;
    }

    destroy(cx: number, cy: number, radius: number, minSize: number = TILE_SIZE) {
        const rectX = this.x;
        const rectY = this.y;
        const rectW = this.width;
        const rectH = this.height;

        if (!circleIntersectsRectangle(cx, cy, radius, rectX, rectY, rectW, rectH)) return;

        if (Math.min(this.width, this.height) <= minSize) {
            this.turnEmpty();
            return;
        }

        if (!this.hasChildren()) {
            this.subdivide(minSize);
        }

        for (const child of this.children) {
            child.destroy(cx, cy, radius, minSize);
        }
    }

    cleanup() {
        if (!this.hasChildren()) return;

        for (const child of this.children) {
            child.cleanup();
        }

        this.children = this.children.filter(child => !child.isEmpty());

        if (this.children.length === 0) {
            this.turnEmpty();
        }
    }

    turnEmpty() {
        this.filled = false;
        this.children = [];
    }

    hasChildren() {
        return this.children.length > 0;
    }

    isEmpty() {
        return !this.filled && !this.hasChildren();
    }
}