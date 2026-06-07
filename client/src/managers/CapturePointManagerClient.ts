import type { CapturePoint } from "@shared/types";
import CapturePointClient from "../game-objects/CapturePointClient";
import type GameScene from "../scenes/GameScene";
import type { Team } from "@shared/enums/Team.enum.ts";
import { CaptureStatus } from "@shared/enums/CaptureStatus.enum";
import SoundManager from "./SoundManager";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";

export default class CapturePointManagerClient {
    private capturePoints: CapturePointClient[];
    private scene: GameScene;
    private playerTeam!: Team;

    constructor(scene: GameScene) {
        this.capturePoints = [];
        this.scene = scene;
    }

    setPlayerTeam(playerTeam: Team) {
        this.playerTeam = playerTeam;
    }

    private clear() {
        this.capturePoints.forEach(capturePoint => {
            capturePoint.destroy();
        });

        this.capturePoints = [];
    }

    private convertTeamToCaptureStatus(team: Team | null) {
        if (team === null) {
            return CaptureStatus.Neutral;
        } else if (team === this.playerTeam) {
            return CaptureStatus.Captured;
        } else {
            return CaptureStatus.EnnemyOwned;
        }
    }

    updateCapturePoint(id: number, newOwningTeam: Team) {
        const captureStatus = this.convertTeamToCaptureStatus(newOwningTeam);

        if (captureStatus === CaptureStatus.Captured) {
            SoundManager.play(RessourceKeys.Capture);
        } else if (captureStatus === CaptureStatus.EnnemyOwned) {
            SoundManager.play(RessourceKeys.Uncapture);
        }
        
        this.capturePoints[id].setStatus(captureStatus);
    }

    syncCapturePoints(capturePoints: CapturePoint[]) {
        if (this.capturePoints.length !== capturePoints.length) {
            this.clear();

            this.capturePoints = capturePoints.map(capturePoint => {
                const cp = new CapturePointClient(this.scene, capturePoint.x, capturePoint.y);
                cp.setStatus(this.convertTeamToCaptureStatus(capturePoint.owningTeam));
                return cp;
            });
        } else {
            capturePoints.forEach((capturePoint, id) => {
                this.capturePoints[id].setStatus(this.convertTeamToCaptureStatus(capturePoint.owningTeam));
            });
        }
    }
}