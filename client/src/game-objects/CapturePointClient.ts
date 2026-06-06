import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import type GameScene from "../scenes/GameScene";
import { Depths } from "@shared/enums/Depths.enum.ts";
import { CaptureStatus } from "@shared/enums/CaptureStatus.enum";
import { CAPTURE_POINT_CONST } from "@shared/const";

export default class CapturePointClient extends Phaser.Physics.Matter.Sprite {
    private status!: CaptureStatus;

    constructor(scene: GameScene, x: number, y: number, ) {
        super(scene.matter.world, x, y, RessourceKeys.CapturePoint);

        scene.add.existing(this);
        (this.body as MatterJS.BodyType).label = RessourceKeys.CapturePoint;
        (this.body as MatterJS.BodyType).isSensor = true;
 
        this.setIgnoreGravity(true);

        this.setDepth(Depths.Fourth);
        this.setStatus(CaptureStatus.Neutral);
    }

    setStatus(status: CaptureStatus) {
        this.status = status;
        this.updateColor();
    }

    private updateColor() {
        switch (this.status) {
            case CaptureStatus.Neutral:
                this.setTint(CAPTURE_POINT_CONST.BASE_COLOR);
                break;
            case CaptureStatus.Self:
                this.setTint(CAPTURE_POINT_CONST.SELF_COLOR);
                break;
            case CaptureStatus.Ennemy:
                this.setTint(CAPTURE_POINT_CONST.ENNEMY_COLOR);
                break;
        }
    }
}