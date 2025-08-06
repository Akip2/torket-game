import { GAME_HEIGHT, GAME_WIDTH, TILE_SIZE } from "../const";

export default class QuadBlock {
    x: number;
    y: number;
    width: number;
    height: number;
    children: QuadBlock[];
    filled: boolean;

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

    subdivideHorizontally() {
        const midX = Math.round(this.x + this.width / 2);
        const hw = Math.round(this.width / 2);

        this.children = [
            new QuadBlock(this.x, this.y, hw, this.height),
            new QuadBlock(midX, this.y, hw, this.height),
        ];
    }

    subdivideVertically() {
        const midY = Math.round(this.y + this.height / 2);
        const hh = Math.round(this.height / 2);

        this.children = [
            new QuadBlock(this.x, this.y, this.width, hh),
            new QuadBlock(this.x, midY, this.width, hh),
        ];
    }

    subdivideEqually() {
        const hw = Math.round(this.width / 2);
        const hh = Math.round(this.height / 2);

        this.children = [
            new QuadBlock(this.x, this.y, hw, hh),
            new QuadBlock(this.x + hw, this.y, hw, hh),
            new QuadBlock(this.x, this.y + hh, hw, hh),
            new QuadBlock(this.x + hw, this.y + hh, hw, hh),
        ];
    }

    subdivide(minSize = TILE_SIZE) {
        if (this.width <= minSize || this.height <= minSize) return;

        const aspectRatio = this.width / this.height;

        if (aspectRatio > 2) {
            this.subdivideHorizontally();
        } else if (aspectRatio < 0.5) {
            this.subdivideVertically();
        } else {
            this.subdivideEqually();
        }

        this.filled = false;
    }

    destroy() {
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