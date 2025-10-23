export default class PrimitiveMap {
    rowSize: number;
    columnSize: number;
    grid: Uint8Array;
    minTileSize: number;

    constructor(grid: Uint8Array, rowSize: number, columnSize: number, minTileSize: number) {
        this.grid = grid;
        this.rowSize = rowSize;
        this.columnSize = columnSize;
        this.minTileSize = minTileSize;
    }

    static createEmptyMap(width: number, height: number, minTileSize: number) {
        const rowSize = width / minTileSize;
        const columnSize = height / minTileSize;
        const grid = new Uint8Array(rowSize * columnSize);

        return new PrimitiveMap(grid, rowSize, columnSize, minTileSize);
    }

    getIndex(x: number, y: number) {
        const tileX = Math.floor(x / this.minTileSize);
        const tileY = Math.floor(y / this.minTileSize);

        return tileX + tileY * this.rowSize;
    }

    add(x: number, y: number) {
        this.grid[this.getIndex(x, y)] = 1;
    }

    remove(x: number, y: number) {
        this.grid[this.getIndex(x, y)] = 0;
    }

    isFilled(x: number, y: number) {
        return this.grid[this.getIndex(x, y)] === 1;
    }

    serialize() {
        const obj = {
            rowSize: this.rowSize,
            columnSize: this.columnSize,
            minTileSize: this.minTileSize,
            grid: Array.from(this.grid),
        };

        return JSON.stringify(obj, null, 2);
    }
}