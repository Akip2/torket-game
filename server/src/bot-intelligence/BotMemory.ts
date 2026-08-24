import { BotMovementAction } from "@shared/enums/BotMovementAction.enum";
import { HitType } from "@shared/enums/HitType.enum";
import { CalculatedTrajectory, Position } from "@shared/types";

export default class BotMemory {
    bestTrajectory: CalculatedTrajectory;
    bestMovements: BotMovementAction[];
    botPositionTurnStart: Position;

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
            hitType: HitType.None,
            useful: false,
        }

        this.bestMovements = [];
        this.botPositionTurnStart = { x: 0, y: 0 };
    }
}