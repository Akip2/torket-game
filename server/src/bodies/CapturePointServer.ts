import { Bodies } from "matter-js";
import GameBody from "./GameBody";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { CAPTURE_POINT_CONST } from "@shared/const";
import { CaptureStatus } from "@shared/enums/CaptureStatus.enum";
import { CapturePoint } from "@shared/types";
import { Team } from "@shared/enums/Team.enum.ts";

export default class CapturePointServer extends GameBody {
    private owningTeam: Team | null;

    constructor(x: number, y: number, id: number) {
        const body = Bodies.circle(x, y, CAPTURE_POINT_CONST.RADIUS, {
            label: RessourceKeys.CapturePoint,
            plugin: id,
            isSensor: true,
            isStatic: true,
        });

        super(body);

        this.owningTeam = null;
    }

    setOwningTeam(owningTeam: Team | null) {
        this.owningTeam = owningTeam;
    }

    getOwningTeam() {
        return this.owningTeam;
    }

    serialize(): CapturePoint {
        return {
            x: this.getX(),
            y: this.getY(),

            owningTeam: this.owningTeam
        }
    }
}