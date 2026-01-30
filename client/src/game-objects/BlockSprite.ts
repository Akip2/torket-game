import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import type GameScene from "../scenes/GameScene";
import { Depths } from "@shared/enums/Depths.eunum";

export default class BlockSprite extends Phaser.GameObjects.TileSprite {
    constructor(scene: GameScene, x: number, y: number, width: number, height: number, tilePosX: number = 0, tilePosY: number = 0) {
        super(scene, x, y, width, height, RessourceKeys.Ground);

        this.setOrigin(0);
        this.setDepth(Depths.Fourth);
        this.tilePositionX = tilePosX;
        this.tilePositionY = tilePosY;
        scene.add.existing(this);
    }
}