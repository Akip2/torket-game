import { FaceExpression } from "@shared/enums/FaceExpression.enum";
import type GameScene from "../scenes/GameScene";
import { Depths } from "@shared/enums/Depths.enum.ts";

export default class PlayerFace extends Phaser.GameObjects.Text {
    constructor(scene: GameScene, playerX: number, playerY: number, style: Phaser.Types.GameObjects.Text.TextStyle) {
        super(scene, playerX, playerY, FaceExpression.HappySmall, style);

        this.setOrigin(0.5);
        this.setDepth(Depths.First);

        scene.add.existing(this);
    }

    updatePlacement(playerX: number, playerY: number) {
        this.x = playerX;
        this.y = playerY;
    }
}