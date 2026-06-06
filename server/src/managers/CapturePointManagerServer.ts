import { CapturePoint, Position } from "@shared/types";
import CapturePointServer from "../bodies/CapturePointServer";
import { CaptureStatus } from "@shared/enums/CaptureStatus.enum";
import PlayerServer from "../bodies/PlayerServer";

export class CapturePointManagerServer {
    private capturePoints: CapturePointServer[];

    constructor(capturePointsPositions: Position[]) {
        if (!capturePointsPositions) {
            this.capturePoints = [];
            return;
        }
        
        this.capturePoints = capturePointsPositions.map((position, id) => {
            return new CapturePointServer(position.x, position.y, id);
        })
    }

    managePlayerContact(id: number, player: PlayerServer, shot: boolean) {
        this.setCapturePoint(id, CaptureStatus.Self);
    }

    setCapturePoint(id: number, status: CaptureStatus) {
        this.capturePoints[id].setStatus(status);
    }

    getSerializedCapturePoints(): CapturePoint[] {
        return this.capturePoints.map(capturePoint => capturePoint.serialize());
    }
}