import { CAPTURE_POINT_CONST, EDITION_TILE_SIZE, GAME_HEIGHT, GAME_WIDTH, GROUND_TYPE, PLAYER_CONST, TEXTURE_SIZE } from "@shared/const";
import PrimitiveMap from "@shared/data/PrimitiveMap";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { SceneNames } from "@shared/enums/SceneNames.enum";
import TextureManager from "../managers/TextureManager";
import { Depths } from "@shared/enums/Depths.enum.ts";
import CameraManager from "../managers/CameraManager";

export default class MapEditionScene extends Phaser.Scene {
    currentMap: PrimitiveMap;
    tiles: Map<string, Phaser.GameObjects.TileSprite> = new Map();
    playerSprites: Phaser.GameObjects.TileSprite[] = [];
    capturePointSprites: Phaser.GameObjects.Image[] = [];

    gridGraphics!: Phaser.GameObjects.Graphics;
    subdivisionGraphics!: Phaser.GameObjects.Graphics;

    brushSize: number = 2;
    brushPreview!: Phaser.GameObjects.Rectangle;

    mirrorMode: boolean = false;
    playerPlacementMode: boolean = false;
    capturePointPlacementMode: boolean = false;

    cameraManager!: CameraManager;

    constructor() {
        super(SceneNames.MapEditor);
        this.currentMap = PrimitiveMap.createEmptyMap();
    }

    preload() {
        this.load.image(RessourceKeys.Ground, `assets/ground/${GROUND_TYPE}_${TEXTURE_SIZE}.png`);
    }

    create() {
        const textureManager = new TextureManager(this.add);
        textureManager.generatePlayerTexture();
        textureManager.generateCapturePointTexture();

        this.cameraManager = new CameraManager(this.cameras.main);

        this.brushPreview = this.add.rectangle(0, 0, EDITION_TILE_SIZE, EDITION_TILE_SIZE, 0x00ff00, 0.25)
            .setOrigin(0)
            .setDepth(Depths.First)
            .setVisible(false);

        this.setupInputs();

        this.drawGrid();
    }

    setupInputs() {
        this.input.on('wheel', (pointer: Phaser.Input.Pointer, _go: any, _dx: number, deltaY: number) => {
            this.cameraManager.handleWheel(pointer, deltaY);
        });

        this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
            this.cameraManager.handlePointerDown(p);
            this.doToolAction(p);
        });

        this.input.on('pointerup', () => {
            this.cameraManager.handlePointerUp();
        });

        this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
            if (!this.cameraManager.handlePointerMove(p)) {
                this.doToolAction(p);
                this.updateBrushPreview(p);
            }
        });
        this.input.mouse?.disableContextMenu();

        const SCALES = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
        for (let i = 1; i < SCALES.length + 1; i++) {
            this.input.keyboard!.on(`keydown-${SCALES[i - 1]}`, () => (this.brushSize = i));
        }
        this.input.keyboard!.on("keydown-B", () => (this.brushSize = 15));

        this.input.keyboard!.on("keydown-M", () => {
            this.mirrorMode = !this.mirrorMode;
        });

        this.input.keyboard!.on("keydown-P", () => {
            this.playerPlacementMode = !this.playerPlacementMode;
            this.capturePointPlacementMode = false;
            this.brushSize = Math.floor(PLAYER_CONST.BASE_WIDTH / EDITION_TILE_SIZE);
        });

        this.input.keyboard!.on("keydown-C", () => {
            this.capturePointPlacementMode = !this.capturePointPlacementMode;
            this.playerPlacementMode = false;
            this.brushSize = Math.floor(CAPTURE_POINT_CONST.RADIUS * 2 / EDITION_TILE_SIZE);
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
    }

    update() {
        this.drawGrid();
    }

    drawGrid() {
        if (!this.gridGraphics) {
            this.gridGraphics = this.add.graphics();
            this.gridGraphics.setDepth(Depths.Third);
        }

        const cam = this.cameras.main;
        const step = EDITION_TILE_SIZE;

        const topLeft = cam.getWorldPoint(0, 0);
        const bottomRight = cam.getWorldPoint(cam.width, cam.height);

        const startX = Math.floor(topLeft.x / step) * step;
        const startY = Math.floor(topLeft.y / step) * step;
        const endX = Math.ceil(bottomRight.x / step) * step;
        const endY = Math.ceil(bottomRight.y / step) * step;

        this.gridGraphics.clear();
        this.gridGraphics.lineStyle(1 / cam.zoom, 0x333333, 0.25);

        for (let x = startX; x <= endX; x += step) {
            this.gridGraphics.moveTo(x, startY);
            this.gridGraphics.lineTo(x, endY);
        }
        for (let y = startY; y <= endY; y += step) {
            this.gridGraphics.moveTo(startX, y);
            this.gridGraphics.lineTo(endX, y);
        }

        this.gridGraphics.strokePath();
    }

    drawSubdivisionAxis() {
        this.subdivisionGraphics = this.add.graphics();
        this.subdivisionGraphics.setDepth(Depths.Second);

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
    }

    doToolAction(pointer: Phaser.Input.Pointer) {
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const x = worldPoint.x;
        const y = worldPoint.y;


        if (pointer.leftButtonDown()) {
            if (this.playerPlacementMode) {
                this.addPlayer(x, y);
            } else if (this.capturePointPlacementMode) {
                this.addCapturePoint(x, y);
            } else {
                this.paintTiles(x, y);
            }
        } else if (pointer.rightButtonDown()) {
            if (this.capturePointPlacementMode) {
                this.removeCapturePoint(x, y);
            } else if (!this.playerPlacementMode) {
                this.eraseTiles(x, y);
            }
        }
    }

    getMirrorX(x: number): number {
        const tileSize = EDITION_TILE_SIZE;
        const tileX = Math.floor(x / tileSize);
        const mirroredTileX = Math.floor(GAME_WIDTH / tileSize) - 1 - tileX;
        return mirroredTileX * tileSize;
    }

    addPlayer(x: number, y: number) {
        const playerX = Math.floor(x / EDITION_TILE_SIZE) * EDITION_TILE_SIZE;
        const playerY = Math.floor(y / EDITION_TILE_SIZE) * EDITION_TILE_SIZE;

        this.currentMap.addPlayerPosition(playerX, playerY);
        this.drawPlayer(playerX, playerY);
    }

    drawPlayer(x: number, y: number) {
        const sprite = this.add.tileSprite(
            x,
            y,
            PLAYER_CONST.BASE_WIDTH,
            PLAYER_CONST.BASE_WIDTH,
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

    addCapturePoint(x: number, y: number) {
        const capturePointX = Math.floor(x / EDITION_TILE_SIZE) * EDITION_TILE_SIZE;
        const capturePointY = Math.floor(y / EDITION_TILE_SIZE) * EDITION_TILE_SIZE;

        this.currentMap.addCapturePointPosition(capturePointX, capturePointY);
        this.drawCapturePoint(capturePointX, capturePointY);
    }

    drawCapturePoint(x: number, y: number) {
        const sprite = this.add.image(x, y, RessourceKeys.CapturePoint)
            .setOrigin(0)
            .setDisplaySize(CAPTURE_POINT_CONST.RADIUS * 2, CAPTURE_POINT_CONST.RADIUS * 2);

        this.capturePointSprites.push(sprite);

        sprite.setInteractive();
        sprite.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            if (this.capturePointPlacementMode && pointer.rightButtonDown()) {
                this.currentMap.removeCapturePointPosition(sprite.x, sprite.y);
                this.capturePointSprites.splice(this.capturePointSprites.indexOf(sprite), 1);

                sprite.destroy();
            }
        });
    }

    removeCapturePoint(x: number, y: number) {
        const capturePointX = Math.floor(x / EDITION_TILE_SIZE) * EDITION_TILE_SIZE;
        const capturePointY = Math.floor(y / EDITION_TILE_SIZE) * EDITION_TILE_SIZE;

        this.currentMap.removeCapturePointPosition(capturePointX, capturePointY);

        const sprite = this.capturePointSprites.find(candidate => candidate.x === capturePointX && candidate.y === capturePointY);
        if (sprite) {
            this.capturePointSprites.splice(this.capturePointSprites.indexOf(sprite), 1);
            sprite.destroy();
        }
    }

    paintTiles(x: number, y: number) {
        this.applyToTiles(x, y, (px, py) => {
            const index = this.generateIndex(px, py);
            if (!this.isFilled(index)) {
                const sprite = this.add.tileSprite(
                    px,
                    py,
                    EDITION_TILE_SIZE,
                    EDITION_TILE_SIZE,
                    RessourceKeys.Ground
                ).setOrigin(0);
                this.tiles.set(index, sprite);
            }
        });
    }

    private isFilled(index: string): boolean {
        return this.tiles.has(index);
    }

    private generateIndex(x: number, y: number): string {
        return `${x}_${y}`;
    }

    eraseTiles(x: number, y: number) {
        this.applyToTiles(x, y, (px, py) => {
            const index = this.generateIndex(px, py);

            if (this.isFilled(index)) {
                const tile = this.tiles.get(index);
                if (tile) {
                    tile.destroy();
                    this.tiles.delete(index);
                }
            }
        });
    }

    applyToTiles(x: number, y: number, action: (px: number, py: number) => void) {
        const tileX = Math.floor(x / EDITION_TILE_SIZE);
        const tileY = Math.floor(y / EDITION_TILE_SIZE);

        for (let dy = 0; dy < this.brushSize; dy++) {
            for (let dx = 0; dx < this.brushSize; dx++) {
                const px = (tileX + dx) * EDITION_TILE_SIZE;
                const py = (tileY + dy) * EDITION_TILE_SIZE;

                action(px, py);

                if (this.mirrorMode) {
                    const mirrorPx = this.getMirrorX(px);
                    action(mirrorPx, py);
                }
            }
        }
    }

    updateBrushPreview(pointer: Phaser.Input.Pointer) {
        const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);
        const tileSize = EDITION_TILE_SIZE;
        const snappedX = Math.floor(worldPoint.x / tileSize) * tileSize;
        const snappedY = Math.floor(worldPoint.y / tileSize) * tileSize;

        this.brushPreview
            .setPosition(snappedX, snappedY)
            .setSize(tileSize * this.brushSize, tileSize * this.brushSize)
            .setFillStyle(pointer.leftButtonDown() ? 0x00ff00 : 0xff0000, 0.25)
            .setVisible(true);
    }

    clear() {
        this.playerSprites.forEach(playerSprite => playerSprite.destroy());
        this.playerSprites = [];

        this.capturePointSprites.forEach(capturePointSprite => capturePointSprite.destroy());
        this.capturePointSprites = [];

        for (const [key, tile] of this.tiles.entries()) {
            tile.destroy();
            this.tiles.delete(key);
        }
        this.currentMap = PrimitiveMap.createEmptyMap();
    }

    drawNewMap() {
        this.currentMap.playerPositions.forEach(playerPosition => {
            this.drawPlayer(playerPosition.x, playerPosition.y);
        });

        this.currentMap.capturePoints.forEach(capturePoint => {
            this.drawCapturePoint(capturePoint.x, capturePoint.y);
        });

        const { rowSize, columnSize } = this.currentMap.getDimensions();
        const minX = this.currentMap.bounds.x.min;
        const minY = this.currentMap.bounds.y.min;

        for (let i = 0; i < rowSize * columnSize; i++) {
            if (this.currentMap.grid[i] === 1) {
                const x = minX + (i % rowSize) * EDITION_TILE_SIZE;
                const y = minY + Math.floor(i / rowSize) * EDITION_TILE_SIZE;

                const sprite = this.add.tileSprite(x, y, EDITION_TILE_SIZE, EDITION_TILE_SIZE, RessourceKeys.Ground).setOrigin(0);
                this.tiles.set(this.generateIndex(x, y), sprite);
            }
        }
    }

    generateBounds() {
        const keys = this.tiles.keys();

        let currentIndex = keys.next().value!;
        let splittedIndex = currentIndex.split("_");
        let x = parseInt(splittedIndex[0]);
        let y = parseInt(splittedIndex[1]);

        const bounds = {
            x: { min: x, max: x },
            y: { min: y, max: y }
        }

        for (const key of keys) {
            currentIndex = key;
            splittedIndex = currentIndex.split("_");
            x = parseInt(splittedIndex[0]);
            y = parseInt(splittedIndex[1]);

            if (x < bounds.x.min) {
                bounds.x.min = x;
            }
            if (x > bounds.x.max) {
                bounds.x.max = x;
            }
            if (y > bounds.y.max) {
                bounds.y.max = y;
            }
            if (y < bounds.y.min) {
                bounds.y.min = y;
            }
        }

        return bounds;
    }

    saveMap() {
        const bounds = this.generateBounds();
        this.currentMap.setBounds(bounds);

        this.currentMap.generateGrid(this.tiles.keys());

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
            const bounds = jsonData.bounds;
            const playerPositions = jsonData.playerPositions ?? [];
            const capturePoints = jsonData.capturePoints ?? [];

            this.clear();
            this.currentMap = new PrimitiveMap(
                primitiveData.grid,
                bounds,
                playerPositions,
                capturePoints
            );
            this.drawNewMap();
        });

        input.click();
    }
}