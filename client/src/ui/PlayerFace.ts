import { FaceExpression } from "@shared/enums/FaceExpression.enum";
import type GameScene from "../scenes/GameScene";
import { Depths } from "@shared/enums/Depths.enum.ts";
import { PLAYER_CONST } from "@shared/const";

export default class PlayerFace extends Phaser.GameObjects.Text {
    private baseFace: FaceExpression;
    private changeFaceTimeoutId?: number;

    constructor(scene: GameScene, playerX: number, playerY: number, style: Phaser.Types.GameObjects.Text.TextStyle, baseFace: FaceExpression = PLAYER_CONST.BASE_FACE) {
        super(scene, playerX, playerY, baseFace, style);

        this.setOrigin(0.5);
        this.setDepth(Depths.First);

        scene.add.existing(this);

        this.baseFace = baseFace;
    }

    updatePlacement(playerX: number, playerY: number) {
        this.x = playerX;
        this.y = playerY;
    }

    changeFace(targetFace: FaceExpression, time: number = 200) {
        clearTimeout(this.changeFaceTimeoutId);
        
        this.setText(targetFace);
        this.changeFaceTimeoutId = setTimeout(() => {
            this.setText(this.baseFace);
        }, time);
    }
}