export default class PrimitiveMap {
    rowSize: number;
    columnSize: number;
    grid: Uint8Array;
    minTileSize: number;

    constructor(width: number, height: number, tileSize: number) {
        this.rowSize = width / tileSize;
        this.columnSize = height / tileSize;
        this.grid = new Uint8Array(this.rowSize * this.columnSize);

        this.minTileSize = tileSize;
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
}