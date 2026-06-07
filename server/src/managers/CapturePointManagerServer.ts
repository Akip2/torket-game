import { CapturePoint, Position } from "@shared/types";
import CapturePointServer from "../bodies/CapturePointServer";
import { Team } from "@shared/enums/Team.enum.ts";
import PhysicsManager from "./PhysicsManager";

export class CapturePointManagerServer {
    private capturePoints: CapturePointServer[];
    private onCapture: (id: number, newOwningTeam: Team | null) => void;

    constructor(physicsManager: PhysicsManager, capturePointsPositions: Position[], onCapture: (id: number, newOwningTeam: Team | null) => void) {
        if (!capturePointsPositions) {
            this.capturePoints = [];
        } else {
            this.capturePoints = capturePointsPositions.map((position, id) => {
                const capturePoint = new CapturePointServer(position.x, position.y, id);
                physicsManager.add(capturePoint);

                return capturePoint;
            })
        }

        this.onCapture = onCapture;
    }

    manageContact(id: number, team: Team, shot: boolean) {
        const capturePoint = this.capturePoints[id];
        const currentOwner = capturePoint.getOwningTeam();

        if (currentOwner !== team.toString()) {
            /*
            if (shot || currentOwner === null) {
                capturePoint.setOwningTeam(team);
            } else {
                capturePoint.setOwningTeam(null);
            }*/
            
            capturePoint.setOwningTeam(team);
            this.onCapture(id, capturePoint.getOwningTeam());
        }
    }

    /**
     * 
     * @returns the winning team, null if there isn't
     */
    getWinner() {
        const dominantTeam = this.capturePoints[0].getOwningTeam();

        for (let i = 1; i < this.capturePoints.length; i++) {
            if (dominantTeam !== this.capturePoints[i].getOwningTeam()) return null;
        }
        return dominantTeam;
    }

    getSerializedCapturePoints(): CapturePoint[] {
        return this.capturePoints.map(capturePoint => capturePoint.serialize());
    }

    getCapturePointsNb() {
        return this.capturePoints.length;
    }
}