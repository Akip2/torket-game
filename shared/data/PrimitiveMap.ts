import type { Position } from "@shared/types";
import QuadBlock from "./QuadBlock";

export default class PrimitiveMap {
    rowSize: number;
    columnSize: number;
    grid: Uint8Array;
    minTileSize: number;

    playerPositions: Position[];

    constructor(grid: Uint8Array, rowSize: number, columnSize: number, minTileSize: number, playerPositions: Position[] = []) {
        this.grid = new Uint8Array(grid);
        this.rowSize = rowSize;
        this.columnSize = columnSize;
        this.minTileSize = minTileSize;
        this.playerPositions = playerPositions;
    }

    static createEmptyMap(width: number, height: number, minTileSize: number) {
        const rowSize = width / minTileSize;
        const columnSize = height / minTileSize;
        const grid = new Uint8Array(rowSize * columnSize);

        return new PrimitiveMap(grid, rowSize, columnSize, minTileSize);
    }

    addPlayerPosition(x: number, y :number) {
        this.playerPositions.push({
            x: x,
            y: y
        });
    }

    removePlayerPosition(x: number, y: number) {
        let i = 0;
        let found = false;

        while (i < this.playerPositions.length && !found) {
            let currentPlayerPosition = this.playerPositions[i];
            found = currentPlayerPosition.x === x && currentPlayerPosition.y === y;

            i++;
        }

        if (found) {
            this.playerPositions.splice(i - 1, 1);
        }
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
            playerPositions: this.playerPositions,
            quadTree: this.toQuadBlock(),

            primitive: {
                rowSize: this.rowSize,
                columnSize: this.columnSize,
                minTileSize: this.minTileSize,
                grid: Array.from(this.grid),
            }
        };

        return JSON.stringify(obj, null, 2);
    }

    toQuadBlock(): QuadBlock {
        const result = this.buildQuadBlock(0, 0, this.rowSize, this.columnSize);
        result.cleanup();

        return result;
    }

    buildQuadBlock(tileX: number, tileY: number, tilesW: number, tilesH: number): QuadBlock {
        const x = tileX * this.minTileSize;
        const y = tileY * this.minTileSize;
        const width = tilesW * this.minTileSize;
        const height = tilesH * this.minTileSize;

        const resQuadBlock = new QuadBlock(x, y, width, height);

        if (tilesW === 1 && tilesH === 1) {
            resQuadBlock.filled = this.isFilled(x, y);
            return resQuadBlock;
        }

        let isFilled = true;
        for (let currentTileY = tileY; currentTileY < tileY + tilesH && isFilled; currentTileY++) {
            for (let currentTileX = tileX; currentTileX < tileX + tilesW && isFilled; currentTileX++) {
                isFilled = this.isFilled(currentTileX * this.minTileSize, currentTileY * this.minTileSize);
            }
        }

        resQuadBlock.filled = isFilled;
        if (!isFilled) {
            if (tilesW !== tilesH) {
                if (tilesW > tilesH) {
                    const leftW = Math.floor(tilesW / 2);
                    const rightW = tilesW - leftW;

                    resQuadBlock.children = [
                        this.buildQuadBlock(tileX, tileY, leftW, tilesH),
                        this.buildQuadBlock(tileX + leftW, tileY, rightW, tilesH)
                    ];
                } else {
                    const topH = Math.floor(tilesH / 2);
                    const bottomH = tilesH - topH;

                    resQuadBlock.children = [
                        this.buildQuadBlock(tileX, tileY, tilesW, topH),
                        this.buildQuadBlock(tileX, tileY + topH, tilesW, bottomH)
                    ];
                }
            } else {
                const half = Math.floor(tilesW / 2);

                resQuadBlock.children = [
                    this.buildQuadBlock(tileX, tileY, half, half),
                    this.buildQuadBlock(tileX + half, tileY, tilesW - half, half),
                    this.buildQuadBlock(tileX, tileY + half, half, tilesH - half),
                    this.buildQuadBlock(tileX + half, tileY + half, tilesW - half, tilesH - half)
                ];
            }
        }

        return resQuadBlock;
    }
}