import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import type GameScene from "../scenes/GameScene";
import { Depths } from "../enums/Depths.enum";
import { CaptureStatus } from "@shared/enums/CaptureStatus.enum";
import { CAPTURE_POINT_CONST } from "@shared/const";

export default class CapturePointClient extends Phaser.Physics.Matter.Sprite {
    private status!: CaptureStatus;

    constructor(scene: GameScene, x: number, y: number,) {
        super(scene.matter.world, x, y, RessourceKeys.CapturePoint);

        (this.body as MatterJS.BodyType).label = RessourceKeys.CapturePoint;
        (this.body as MatterJS.BodyType).isSensor = true;

        this.setIgnoreGravity(true);

        this.setDepth(Depths.Tenth);
        this.setStatus(CaptureStatus.Neutral);

        scene.worldContainer.add(this);
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
            case CaptureStatus.Captured:
                this.setTint(CAPTURE_POINT_CONST.SELF_COLOR);
                break;
            case CaptureStatus.EnnemyOwned:
                this.setTint(CAPTURE_POINT_CONST.ENNEMY_COLOR);
                break;
        }
    }
}