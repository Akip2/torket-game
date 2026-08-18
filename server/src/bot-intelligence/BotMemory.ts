import { CalculatedTrajectory } from "@shared/types";

export default class BotMemory {
    bestTrajectory: CalculatedTrajectory;

    constructor() {
        this.bestTrajectory = {
            shootInfo: {
                originX: 0,
                originY: 0,
                force: 0,
                targetX: 0,
                targetY: 0
            },
            collisionNumber: 0,
            hitTarget: false,
            useful: false,
        }
    }
}