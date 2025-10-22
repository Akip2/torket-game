import { GAME_HEIGHT, GAME_WIDTH, TEXTURE_SIZE, TILE_SIZE } from "@shared/const";
import PrimitiveMap from "@shared/data/PrimitiveMap"
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";

export default class MapEditionScene extends Phaser.Scene {
    currentMap: PrimitiveMap;
    tiles: Phaser.GameObjects.TileSprite[] = []

    isPointerDown: boolean = false;

    constructor() {
        super('MapEditor');

        this.currentMap = new PrimitiveMap(GAME_WIDTH, GAME_HEIGHT, TILE_SIZE);
    }

    preload() {
        this.load.image(RessourceKeys.Ground, `assets/ground/ground_${TEXTURE_SIZE}.png`);
    }

    create() {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => this.pointerDownEvent(pointer));
        this.input.on('pointerup', () => this.pointerUpEvent());
        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => this.pointerMoveEvent(pointer));
    }

    pointerDownEvent(pointer: Phaser.Input.Pointer) {
        this.isPointerDown = true;
        this.addTile(pointer.x, pointer.y);
    }

    pointerUpEvent() {
        this.isPointerDown = false;
    }

    pointerMoveEvent(pointer: Phaser.Input.Pointer) {
        if (this.isPointerDown) {
            this.addTile(pointer.x, pointer.y);
        }
    }

    addTile(x: number, y: number) {
        if (this.currentMap.isFilled(x, y)) return;

        this.currentMap.add(x, y);

        const sprite = this.add.tileSprite(
            Math.floor(x / this.currentMap.minTileSize) * this.currentMap.minTileSize,
            Math.floor(y / this.currentMap.minTileSize) * this.currentMap.minTileSize,
            this.currentMap.minTileSize,
            this.currentMap.minTileSize,
            RessourceKeys.Ground
        ).setOrigin(0);

        const index = this.currentMap.getIndex(x, y);
        this.tiles[index] = sprite;
    }

    removeTile(x: number, y: number) {
        this.currentMap.remove(x, y);

        const index = this.currentMap.getIndex(x, y);
        const [removedTile] = this.tiles.splice(index, 1);

        removedTile.destroy();
    }
}