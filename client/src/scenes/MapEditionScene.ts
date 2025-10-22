import { GAME_HEIGHT, GAME_WIDTH, TEXTURE_SIZE, TILE_SIZE } from "@shared/const";
import PrimitiveMap from "@shared/data/PrimitiveMap";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";

export default class MapEditionScene extends Phaser.Scene {
    currentMap: PrimitiveMap;
    tiles: Phaser.GameObjects.TileSprite[] = [];

    brushSize: number = 2; // brush and eraser size in tiles
    brushPreview!: Phaser.GameObjects.Rectangle;

    constructor() {
        super("MapEditor");
        this.currentMap = new PrimitiveMap(GAME_WIDTH, GAME_HEIGHT, TILE_SIZE);
    }

    preload() {
        this.load.image(RessourceKeys.Ground, `assets/ground/ground_${TEXTURE_SIZE}.png`);
    }

    create() {
        this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => this.doToolAction(pointer));
        this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
            this.doToolAction(pointer);
            this.updateBrushPreview(pointer);
        });
        this.input.mouse?.disableContextMenu();

        this.input.keyboard!.on("keydown-ONE", () => (this.brushSize = 1));
        this.input.keyboard!.on("keydown-TWO", () => (this.brushSize = 2));
        this.input.keyboard!.on("keydown-THREE", () => (this.brushSize = 3));
        this.input.keyboard!.on("keydown-FOUR", () => (this.brushSize = 4));

        this.brushPreview = this.add.rectangle(0, 0, TILE_SIZE, TILE_SIZE, 0x00ff00, 0.25)
            .setOrigin(0)
            .setDepth(1000)
            .setVisible(false);
    }

    doToolAction(pointer: Phaser.Input.Pointer) {
        if (pointer.leftButtonDown()) {
            this.paintTiles(pointer.x, pointer.y);
        } else if (pointer.rightButtonDown()) {
            this.eraseTiles(pointer.x, pointer.y);
        }
    }

    paintTiles(x: number, y: number) {
        const tileX = Math.floor(x / this.currentMap.minTileSize);
        const tileY = Math.floor(y / this.currentMap.minTileSize);

        for (let dy = 0; dy < this.brushSize; dy++) {
            for (let dx = 0; dx < this.brushSize; dx++) {
                const px = (tileX + dx) * this.currentMap.minTileSize;
                const py = (tileY + dy) * this.currentMap.minTileSize;

                if (!this.currentMap.isFilled(px, py)) {
                    this.currentMap.add(px, py);

                    const sprite = this.add.tileSprite(
                        px,
                        py,
                        this.currentMap.minTileSize,
                        this.currentMap.minTileSize,
                        RessourceKeys.Ground
                    ).setOrigin(0);

                    const index = this.currentMap.getIndex(px, py);
                    this.tiles[index] = sprite;
                }
            }
        }
    }

    eraseTiles(x: number, y: number) {
        const tileX = Math.floor(x / this.currentMap.minTileSize);
        const tileY = Math.floor(y / this.currentMap.minTileSize);

        for (let dy = 0; dy < this.brushSize; dy++) {
            for (let dx = 0; dx < this.brushSize; dx++) {
                const px = (tileX + dx) * this.currentMap.minTileSize;
                const py = (tileY + dy) * this.currentMap.minTileSize;

                if (this.currentMap.isFilled(px, py)) {
                    this.currentMap.remove(px, py);

                    const index = this.currentMap.getIndex(px, py);
                    const tile = this.tiles[index];
                    if (tile) {
                        tile.destroy();
                        delete this.tiles[index];
                    };
                }
            }
        }
    }

    updateBrushPreview(pointer: Phaser.Input.Pointer) {
        const tileSize = this.currentMap.minTileSize;
        const snappedX = Math.floor(pointer.x / tileSize) * tileSize;
        const snappedY = Math.floor(pointer.y / tileSize) * tileSize;

        this.brushPreview
            .setPosition(snappedX, snappedY)
            .setSize(tileSize * this.brushSize, tileSize * this.brushSize)
            .setFillStyle(pointer.leftButtonDown() ? 0x00ff00 : 0xff0000, 0.25)
            .setVisible(true);
    }
}
