import { EDITION_TILE_SIZE } from "../const";
import type { Bounds, Position } from "../types";
import QuadBlock from "./QuadBlock";

export default class PrimitiveMap {
    playerPositions: Position[];
    capturePoints: Position[];
    bounds: Bounds;
    grid: Uint8Array;

    constructor(
        grid = [],
        bounds: Bounds = { x: { min: 0, max: 0 }, y: { min: 0, max: 0 } },
        playerPositions: Position[] = [],
        capturePoints: Position[] = []
    ) {
        this.grid = new Uint8Array(grid);
        this.bounds = bounds;
        this.playerPositions = playerPositions;
        this.capturePoints = capturePoints;
    }

    static createEmptyMap() {
        return new PrimitiveMap();
    }

    addPlayerPosition(x: number, y: number) {
        this.playerPositions.push({
            x: x,
            y: y
        });
    }

    addCapturePointPosition(x: number, y: number) {
        this.capturePoints.push({
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

    removeCapturePointPosition(x: number, y: number) {
        let i = 0;
        let found = false;

        while (i < this.capturePoints.length && !found) {
            const currentCapturePoint = this.capturePoints[i];
            found = currentCapturePoint.x === x && currentCapturePoint.y === y;

            i++;
        }

        if (found) {
            this.capturePoints.splice(i - 1, 1);
        }
    }

    serialize() {
        const { rowSize, columnSize } = this.getDimensions();

        const obj = {
            bounds: this.bounds,
            playerPositions: this.playerPositions,
            capturePoints: this.capturePoints,
            quadTree: this.toQuadBlock(),

            primitive: {
                rowSize: rowSize,
                columnSize: columnSize,
                minTileSize: EDITION_TILE_SIZE,
                grid: Array.from(this.grid),
            }
        };

        return JSON.stringify(obj, null, 2);
    }

    getDimensions() {
        const rowSize =
            (this.bounds.x.max - this.bounds.x.min) /
            EDITION_TILE_SIZE + 1;

        const columnSize =
            (this.bounds.y.max - this.bounds.y.min) /
            EDITION_TILE_SIZE + 1;

        return { rowSize: rowSize, columnSize: columnSize };
    }

    toQuadBlock(): QuadBlock {
        const { rowSize, columnSize } = this.getDimensions();
        const result = this.buildQuadBlock(0, 0, rowSize, columnSize);
        result.cleanup();

        return result;
    }

    convertMapIndexToGridIndex(mapIndex?: string) {
        if (!mapIndex) return -1;

        const [x, y] = mapIndex.split("_").map(Number);
        const { rowSize } = this.getDimensions();
        return ((x - this.bounds.x.min) / EDITION_TILE_SIZE) + ((y - this.bounds.y.min) / EDITION_TILE_SIZE) * rowSize;
    }

    generateGrid(tileIndices: MapIterator<string>) {
        const { rowSize, columnSize } = this.getDimensions();

        this.grid = new Uint8Array(rowSize * columnSize);
        for (const tileIndex of tileIndices) {
            const gridIndex = this.convertMapIndexToGridIndex(tileIndex);
            this.grid[gridIndex] = 1;
        }
    }

    setBounds(bounds: Bounds) {
        this.bounds = bounds;
    }

    getIndex(x: number, y: number) {
        const { rowSize } = this.getDimensions();

        const tileX = Math.floor(
            (x - this.bounds.x.min) / EDITION_TILE_SIZE
        );

        const tileY = Math.floor(
            (y - this.bounds.y.min) / EDITION_TILE_SIZE
        );

        return tileX + tileY * rowSize;
    }

    isFilled(x: number, y: number) {
        return this.grid[this.getIndex(x, y)] === 1;
    }

    buildQuadBlock(tileX: number, tileY: number, tilesW: number, tilesH: number): QuadBlock {
        const x = tileX * EDITION_TILE_SIZE;
        const y = tileY * EDITION_TILE_SIZE;
        const width = tilesW * EDITION_TILE_SIZE;
        const height = tilesH * EDITION_TILE_SIZE;

        const resQuadBlock = new QuadBlock(x, y, width, height);

        if (tilesW === 1 && tilesH === 1) {
            resQuadBlock.filled = this.isFilled(x, y);
            return resQuadBlock;
        }

        let isFilled = true;
        for (let currentTileY = tileY; currentTileY < tileY + tilesH && isFilled; currentTileY++) {
            for (let currentTileX = tileX; currentTileX < tileX + tilesW && isFilled; currentTileX++) {
                isFilled = this.isFilled(currentTileX * EDITION_TILE_SIZE, currentTileY * EDITION_TILE_SIZE);
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