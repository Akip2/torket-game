import { Depths } from "@shared/enums/Depths.enum";
import { FaceExpression } from "@shared/enums/FaceExpression.enum";
import type GameScene from "../scenes/GameScene";
import { PLAYER_CONST } from "@shared/const";
import { wait } from "@shared/utils";

export default class PlayerFace extends Phaser.GameObjects.Text {
    private baseFace: FaceExpression;
    private changeFaceTimeoutId?: ReturnType<typeof setTimeout>;
    private blinkTimeoutId?: ReturnType<typeof setTimeout>;

    constructor(scene: GameScene, playerX: number, playerY: number, style: Phaser.Types.GameObjects.Text.TextStyle, baseFace: FaceExpression = PLAYER_CONST.BASE_FACE) {
        super(scene, playerX, playerY, baseFace, style);

        this.setOrigin(0.5);
        this.setDepth(Depths.First);

        scene.add.existing(this);

        this.baseFace = baseFace;
        this.startBlinking();
    }

    updatePlacement(playerX: number, playerY: number) {
        this.x = playerX;
        this.y = playerY;
    }

    changeFace(targetFace: FaceExpression, time: number = 500) {
        clearTimeout(this.changeFaceTimeoutId);
        
        this.setText(targetFace);
        this.changeFaceTimeoutId = setTimeout(() => {
            this.setText(this.baseFace);
        }, time);
    }

    private startBlinking() {
        const scheduleNextBlink = () => {
            const delay = 500 + Math.random() * 6000; // entre 2 et 6 secondes
            this.blinkTimeoutId = setTimeout(async () => {
                const closedEyeTime = 150;

                if (this.text === this.baseFace) {
                    this.changeFace(FaceExpression.Annoyed, closedEyeTime);
                    await wait(closedEyeTime);
                    scheduleNextBlink();
                }
            }, delay);
        };

        scheduleNextBlink();
    }

    destroy(fromScene?: boolean) {
        clearTimeout(this.changeFaceTimeoutId);
        clearTimeout(this.blinkTimeoutId);
        super.destroy(fromScene);
    }
}