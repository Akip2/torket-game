import type { QuadBlockType, Rectangle } from "../types";
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

    collidesWithCircle(cx: number, cy: number, radius: number): boolean {
        if (!circleIntersectsRectangle(
            cx, cy, radius,
            this.x, this.y, this.width, this.height
        )) {
            return false;
        }

        if (!this.hasChildren()) {
            return this.filled;
        }

        return this.children.some(child =>
            child.collidesWithCircle(cx, cy, radius)
        );
    }

    collidesWithRect(x: number, y: number, width: number, height: number): boolean {
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        const rectMinX = x - halfWidth;
        const rectMaxX = x + halfWidth;
        const rectMinY = y - halfHeight;
        const rectMaxY = y + halfHeight;

        if (rectMaxX < this.x || rectMinX > this.x + this.width ||
            rectMaxY < this.y || rectMinY > this.y + this.height) {
            return false;
        }

        if (this.filled) return true;

        if (!this.children || this.children.length === 0) return false;

        return this.children.some(child => child.collidesWithRect(x, y, width, height));
    }

    static mergeAdjacentBlocks(
        blocks: QuadBlock[]
    ): Rectangle[] {
        if (blocks.length === 0) {
            return [];
        }

        let rects: Rectangle[] = blocks.map(block => ({
            x: block.x,
            y: block.y,
            width: block.width,
            height: block.height,
        }));

        let changed = true;

        while (changed) {
            changed = false;

            // Fusion horizontale
            rects.sort((a, b) => {
                if (a.y !== b.y) {
                    return a.y - b.y;
                }

                if (a.height !== b.height) {
                    return a.height - b.height;
                }

                return a.x - b.x;
            });

            for (let i = 0; i < rects.length - 1; i++) {
                const current = rects[i];
                const next = rects[i + 1];

                const sameRow =
                    current.y === next.y &&
                    current.height === next.height;

                const touchingHorizontally =
                    current.x + current.width === next.x;

                if (!sameRow || !touchingHorizontally) {
                    continue;
                }

                current.width += next.width;
                rects.splice(i + 1, 1);

                changed = true;
                break;
            }

            if (changed) {
                continue;
            }

            // Fusion verticale
            rects.sort((a, b) => {
                if (a.x !== b.x) {
                    return a.x - b.x;
                }

                if (a.width !== b.width) {
                    return a.width - b.width;
                }

                return a.y - b.y;
            });

            for (let i = 0; i < rects.length - 1; i++) {
                const current = rects[i];
                const next = rects[i + 1];

                const sameColumn =
                    current.x === next.x &&
                    current.width === next.width;

                const touchingVertically =
                    current.y + current.height === next.y;

                if (!sameColumn || !touchingVertically) {
                    continue;
                }

                current.height += next.height;
                rects.splice(i + 1, 1);

                changed = true;
                break;
            }
        }

        return rects;
    }
}