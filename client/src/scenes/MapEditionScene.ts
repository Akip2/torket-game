import { EDITION_TILE_SIZE, GAME_HEIGHT, GAME_WIDTH, PLAYER_CONST } from "@shared/const";
import PrimitiveMap from "@shared/data/PrimitiveMap";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { SceneNames } from "@shared/enums/SceneNames.enum";
import TextureManager from "../managers/TextureManager";

export default class MapEditionScene extends Phaser.Scene {
    currentMap: PrimitiveMap;
    tiles: Phaser.GameObjects.TileSprite[] = [];
    playerSprites: Phaser.GameObjects.TileSprite[] = [];

    gridGraphics!: Phaser.GameObjects.Graphics;
    subdivisionGraphics!: Phaser.GameObjects.Graphics;

    brushSize: number = 2;
    brushPreview!: Phaser.GameObjects.Rectangle;

    mirrorMode: boolean = false;
    playerPlacementMode: boolean = false;

    constructor() {
        super(SceneNames.MapEditor);
        this.currentMap = PrimitiveMap.createEmptyMap(GAME_WIDTH, GAME_HEIGHT, EDITION_TILE_SIZE);
    }

    preload() {
        this.load.image(RessourceKeys.Ground, `assets/ground/ground_16.png`);
    }

    create() {
        new TextureManager(this.add).generatePlayerTexture();

        this.input.on("pointerdown", (p: Phaser.Input.Pointer) => this.doToolAction(p));
        this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
            this.doToolAction(p);
            this.updateBrushPreview(p);
        });
        this.input.mouse?.disableContextMenu();

        this.input.keyboard!.on("keydown-ONE", () => (this.brushSize = 1));
        this.input.keyboard!.on("keydown-TWO", () => (this.brushSize = 2));
        this.input.keyboard!.on("keydown-THREE", () => (this.brushSize = 3));
        this.input.keyboard!.on("keydown-FOUR", () => (this.brushSize = 4));
        this.input.keyboard!.on("keydown-B", () => (this.brushSize = 15));

        this.input.keyboard!.on("keydown-M", () => {
            this.mirrorMode = !this.mirrorMode;
        });

        this.input.keyboard!.on("keydown-P", () => {
            this.playerPlacementMode = !this.playerPlacementMode;
            this.brushSize = Math.floor(PLAYER_CONST.WIDTH / this.currentMap.minTileSize);
        });

        this.input.keyboard!.on("keydown-A", () => {
            if (this.subdivisionGraphics) {
                this.subdivisionGraphics.destroy();
                this.subdivisionGraphics = null!;
            } else {
                this.drawSubdivisionAxis();
            }
        });

        this.input.keyboard!.on("keydown-S", () => this.saveMap());
        this.input.keyboard!.on("keydown-L", () => this.loadMap());

        this.brushPreview = this.add.rectangle(0, 0, EDITION_TILE_SIZE, EDITION_TILE_SIZE, 0x00ff00, 0.25)
            .setOrigin(0)
            .setDepth(1000)
            .setVisible(false);

        this.drawGrid();
    }

    drawGrid() {
        this.gridGraphics = this.add.graphics();
        this.gridGraphics.lineStyle(1, 0x333333, 0.25);

        const step = this.currentMap.minTileSize;

        for (let x = 0; x <= GAME_WIDTH; x += step) {
            this.gridGraphics.moveTo(x, 0);
            this.gridGraphics.lineTo(x, GAME_HEIGHT);
        }
        for (let y = 0; y <= GAME_HEIGHT; y += step) {
            this.gridGraphics.moveTo(0, y);
            this.gridGraphics.lineTo(GAME_WIDTH, y);
        }
        this.gridGraphics.strokePath();

        this.gridGraphics.setDepth(999);
    }

    drawSubdivisionAxis() {
        this.subdivisionGraphics = this.add.graphics();
        this.subdivisionGraphics.setDepth(1000);

        this.subdivisionGraphics.lineStyle(0.25, 0x00ffff, 0.5);
        const fractions = [1 / 8, 3 / 8, 5 / 8, 7 / 8];
        for (const f of fractions) {
            this.subdivisionGraphics.strokeLineShape(new Phaser.Geom.Line(Math.floor(GAME_WIDTH * f), 0, Math.floor(GAME_WIDTH * f), GAME_HEIGHT));
            this.subdivisionGraphics.strokeLineShape(new Phaser.Geom.Line(0, Math.floor(GAME_HEIGHT * f), GAME_WIDTH, Math.floor(GAME_HEIGHT * f)));
        }

        this.subdivisionGraphics.lineStyle(1, 0x0000ff, 0.75);
        this.subdivisionGraphics.strokeLineShape(new Phaser.Geom.Line(GAME_WIDTH / 4, 0, GAME_WIDTH / 4, GAME_HEIGHT));
        this.subdivisionGraphics.strokeLineShape(new Phaser.Geom.Line((GAME_WIDTH / 4) * 3, 0, (GAME_WIDTH / 4) * 3, GAME_HEIGHT));
        this.subdivisionGraphics.strokeLineShape(new Phaser.Geom.Line(0, GAME_HEIGHT / 4, GAME_WIDTH, GAME_HEIGHT / 4));
        this.subdivisionGraphics.strokeLineShape(new Phaser.Geom.Line(0, (GAME_HEIGHT / 4) * 3, GAME_WIDTH, (GAME_HEIGHT / 4) * 3));

        this.subdivisionGraphics.lineStyle(2, 0xff0000, 0.75);
        this.subdivisionGraphics.strokeLineShape(new Phaser.Geom.Line(GAME_WIDTH / 2, 0, GAME_WIDTH / 2, GAME_HEIGHT));
        this.subdivisionGraphics.strokeLineShape(new Phaser.Geom.Line(0, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT / 2));

        this.subdivisionGraphics.setDepth(1001);
    }

    doToolAction(pointer: Phaser.Input.Pointer) {
        const x = pointer.x;
        const y = pointer.y;

        if (pointer.leftButtonDown()) {
            if (this.playerPlacementMode) {
                this.addPlayer(x, y);
            } else {
                this.paintTiles(x, y);
            }
        } else if (pointer.rightButtonDown() && !this.playerPlacementMode) {
            this.eraseTiles(x, y);
        }
    }

    getMirrorX(x: number): number {
        const tileSize = this.currentMap.minTileSize;
        const tileX = Math.floor(x / tileSize);
        const mirroredTileX = this.currentMap.rowSize - 1 - tileX;
        return mirroredTileX * tileSize;
    }

    addPlayer(x: number, y: number) {
        const playerX = Math.floor(x / this.currentMap.minTileSize) * this.currentMap.minTileSize;
        const playerY = Math.floor(y / this.currentMap.minTileSize) * this.currentMap.minTileSize;

        this.currentMap.addPlayerPosition(playerX, playerY);
        this.drawPlayer(playerX, playerY);
    }

    drawPlayer(x: number, y: number) {
        const sprite = this.add.tileSprite(
            x,
            y,
            PLAYER_CONST.WIDTH,
            PLAYER_CONST.WIDTH,
            RessourceKeys.Player
        ).setOrigin(0);

        this.playerSprites.push(sprite);

        sprite.setInteractive();

        sprite.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (this.playerPlacementMode && pointer.rightButtonDown()) {
                this.currentMap.removePlayerPosition(sprite.x, sprite.y);
                this.playerSprites.splice(this.playerSprites.indexOf(sprite), 1);

                sprite.destroy();
            }
        });
    }

    paintTiles(x: number, y: number) {
        this.applyToTiles(x, y, (px, py) => {
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
        });
    }

    eraseTiles(x: number, y: number) {
        this.applyToTiles(x, y, (px, py) => {
            if (this.currentMap.isFilled(px, py)) {
                this.currentMap.remove(px, py);
                const index = this.currentMap.getIndex(px, py);
                const tile = this.tiles[index];
                if (tile) {
                    tile.destroy();
                    delete this.tiles[index];
                }
            }
        });
    }

    applyToTiles(x: number, y: number, action: (px: number, py: number) => void) {
        const tileX = Math.floor(x / this.currentMap.minTileSize);
        const tileY = Math.floor(y / this.currentMap.minTileSize);

        for (let dy = 0; dy < this.brushSize; dy++) {
            for (let dx = 0; dx < this.brushSize; dx++) {
                const px = (tileX + dx) * this.currentMap.minTileSize;
                const py = (tileY + dy) * this.currentMap.minTileSize;

                action(px, py);

                if (this.mirrorMode) {
                    const mirrorPx = this.getMirrorX(px);
                    action(mirrorPx, py);
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

    clear() {
        this.playerSprites.forEach(playerSprite => playerSprite.destroy());
        this.playerSprites = [];

        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i]?.destroy();
            delete this.tiles[i];
        }
        this.currentMap = PrimitiveMap.createEmptyMap(GAME_WIDTH, GAME_HEIGHT, EDITION_TILE_SIZE);
    }

    drawNewMap() {
        this.currentMap.playerPositions.forEach(playerPosition => {
            this.drawPlayer(playerPosition.x, playerPosition.y);
        });

        for (let i = 0; i < this.currentMap.rowSize * this.currentMap.columnSize; i++) {
            if (this.currentMap.grid[i] === 1) {
                const x = (i % this.currentMap.rowSize) * this.currentMap.minTileSize;
                const y = Math.floor(i / this.currentMap.rowSize) * this.currentMap.minTileSize;

                const sprite = this.add.tileSprite(
                    x,
                    y,
                    this.currentMap.minTileSize,
                    this.currentMap.minTileSize,
                    RessourceKeys.Ground
                ).setOrigin(0);

                this.tiles[i] = sprite;
            }
        }
    }

    saveMap() {
        const json = this.currentMap.serialize();
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "map.json";
        a.click();
        URL.revokeObjectURL(url);
    }

    loadMap() {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";

        input.addEventListener("change", async (event: Event) => {
            const target = event.target as HTMLInputElement;
            if (!target.files || target.files.length === 0) return;

            const file = target.files[0];
            const text = await file.text();
            const jsonData = JSON.parse(text);

            const primitiveData = jsonData.primitive;
            const playerPositions = jsonData.playerPositions;

            this.clear();
            this.currentMap = new PrimitiveMap(primitiveData.grid, primitiveData.rowSize, primitiveData.columnSize, primitiveData.minTileSize, playerPositions);
            this.drawNewMap();
        });

        input.click();
    }
}