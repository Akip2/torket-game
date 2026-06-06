import { Bodies } from "matter-js";
import GameBody from "./GameBody";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { CAPTURE_POINT_CONST } from "@shared/const";
import { CaptureStatus } from "@shared/enums/CaptureStatus.enum";
import { CapturePoint } from "@shared/types";

export default class CapturePointServer extends GameBody {
    private status: CaptureStatus;

    constructor(x: number, y: number, id: number) {
        const body = Bodies.circle(x, y, CAPTURE_POINT_CONST.RADIUS, {
            label: RessourceKeys.CapturePoint,
            plugin: id,
            isSensor: true,
            isStatic: true,
        });

        super(body);

        this.status = CaptureStatus.Neutral;
    }

    setStatus(status: CaptureStatus) {
        this.status = status;
    }

    serialize(): CapturePoint {
        return {
            x: this.getX(),
            y: this.getY(),

            status: this.status
        }
    }
}