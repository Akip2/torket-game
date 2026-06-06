import type { CapturePoint } from "@shared/types";
import CapturePointClient from "../game-objects/CapturePointClient";
import type GameScene from "../scenes/GameScene";

export default class CapturePointManagerClient {
    private capturePoints: CapturePointClient[];
    private scene: GameScene;

    constructor(scene: GameScene) {
        this.capturePoints = [];
        this.scene = scene;
    }

    private clear() {
        this.capturePoints.forEach(capturePoint => {
            capturePoint.destroy();
        });

        this.capturePoints = [];
    }

    syncCapturePoints(capturePoints: CapturePoint[]) {
        if (this.capturePoints.length !== capturePoints.length) {
            this.clear();

            this.capturePoints = capturePoints.map(capturePoint => {
                const cp = new CapturePointClient(this.scene, capturePoint.x, capturePoint.y);
                cp.setStatus(capturePoint.status);
                return cp;
            });
        } else {
            capturePoints.forEach((capturePoint, id) => {
                this.capturePoints[id].setStatus(capturePoint.status);
            });
        }
    }
}