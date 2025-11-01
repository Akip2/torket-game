import type { QuadBlockType, Rectangle } from "@shared/types";
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

    getFilledBlocks(): QuadBlock[] {
        let res: QuadBlock[] = [];

        if (this.filled) {
            res = [this];
        } else if (this.hasChildren()) {
            for (const child of this.children) {
                res = res.concat(child.getFilledBlocks());
            }
        }

        return res;
    }

    static mergeAdjacentBlocks(blocks: QuadBlock[]): Rectangle[] {
        if (blocks.length === 0) return [];

        const sorted = [...blocks].sort((a, b) => {
            if (a.x !== b.x) return a.x - b.x;
            return a.y - b.y;
        });

        const merged: Array<{ x: number, y: number, width: number, height: number }> = [];
        const used = new Set<number>();

        for (let i = 0; i < sorted.length; i++) {
            if (used.has(i)) continue;

            const block = sorted[i];
            let x = block.x;
            let y = block.y;
            let width = block.width;
            let height = block.height;

            let foundAdjacent = true;
            while (foundAdjacent) {
                foundAdjacent = false;

                for (let j = i + 1; j < sorted.length; j++) {
                    if (used.has(j)) continue;

                    const next = sorted[j];

                    if (next.x > x) break;

                    if (next.x === x && next.width === width && next.y === y + height) {
                        height += next.height;
                        used.add(j);
                        foundAdjacent = true;
                        break;
                    }
                }
            }

            merged.push({ x, y, width, height });
            used.add(i);
        }

        const finalMerged: Array<{ x: number, y: number, width: number, height: number }> = [];
        const usedMerged = new Set<number>();

        merged.sort((a, b) => {
            if (a.y !== b.y) return a.y - b.y;
            return a.x - b.x;
        });

        for (let i = 0; i < merged.length; i++) {
            if (usedMerged.has(i)) continue;

            let rect = merged[i];
            let x = rect.x;
            let y = rect.y;
            let width = rect.width;
            let height = rect.height;

            let foundAdjacent = true;
            while (foundAdjacent) {
                foundAdjacent = false;

                for (let j = i + 1; j < merged.length; j++) {
                    if (usedMerged.has(j)) continue;

                    const next = merged[j];

                    if (next.y > y) break;

                    if (next.y === y && next.height === height && next.x === x + width) {
                        width += next.width;
                        usedMerged.add(j);
                        foundAdjacent = true;
                        break;
                    }
                }
            }

            finalMerged.push({ x, y, width, height });
            usedMerged.add(i);
        }

        return finalMerged;
    }
}