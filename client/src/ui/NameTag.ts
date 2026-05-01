import { PLAYER_CONST } from "@shared/const";
import type GameScene from "../scenes/GameScene";
import { Depths } from "@shared/enums/Depths.enum.ts";

export default class NameTag extends Phaser.GameObjects.Text {
    private marginOffsetY: number;

    constructor(scene: GameScene, name: string, playerX: number, playerY: number, style: Phaser.Types.GameObjects.Text.TextStyle) {
        super(scene, playerX, playerY + PLAYER_CONST.BASE_WIDTH + 10, name, style);

        this.setOrigin(0.5);
        this.setDepth(Depths.First);

        scene.add.existing(this);
        this.marginOffsetY = 0;
    }

    updatePlacement(playerX: number, playerY: number) {
        this.x = playerX;
        this.y = playerY + PLAYER_CONST.BASE_WIDTH + 2.5 - this.marginOffsetY;
    }

    setMarginOffsetY(offset: number) {
        this.marginOffsetY = offset;
    }
}