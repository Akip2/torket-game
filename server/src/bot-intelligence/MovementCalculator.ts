import QuadBlock from "@shared/data/QuadBlock";
import { BotMovementAction } from "@shared/enums/BotMovementAction.enum";
import { GRAVITY, PLAYER_CONST } from "@shared/const";
import TrajectoryCalculator from "./TrajectoryCalculator";
import BotPerception from "./BotPerception";
import BotMemory from "./BotMemory";

type BotSimulatedState = {
    x: number;
    y: number;

    velocityX: number;
    velocityY: number;

    movementLeft: number;
    actions: BotMovementAction[];
    jumpCoef: number;
    step: number;
}

type SimplifiedSimulatedBotState = {
    actions: BotMovementAction[];
    score: number;
}

const ACTIONS = [
    //BotMovementAction.None,
    BotMovementAction.Right,
    BotMovementAction.Left,
    BotMovementAction.Jump,
    //BotMovementAction.JumpLeft,
    //BotMovementAction.JumpRight,
];

const MAX_STEP = 7;
export default class MovementCalculator {
    constructor(private botPerception: BotPerception, private botMemory: BotMemory, private terrain: QuadBlock, private trajectoryCalculator: TrajectoryCalculator) {

    }

    findBestMovements() {
        const startState = {
            x: this.botPerception.selfPosition.x,
            y: this.botPerception.selfPosition.y,

            velocityX: this.botPerception.selfVelocity.x,
            velocityY: this.botPerception.selfVelocity.y,

            movementLeft: this.botPerception.selfMovementLeft,
            actions: [],
            jumpCoef: 1,
            step: 0,
        };

        return this.simulateStep(startState, BotMovementAction.None).actions;
    }

    private isOnGround(x: number, y: number): boolean {
        return this.terrain.collidesWithRect(
            x,
            y + (PLAYER_CONST.BASE_WIDTH / 2),
            1,
            1
        );
    }

    private fallingToDeath(x: number, y: number): boolean {
        return !this.terrain.collidesWithRect(
            x,
            y + 700 / 2,
            PLAYER_CONST.BASE_WIDTH / 4,
            700
        );
    }

    private botCollides(x: number, y: number) {
        return this.terrain.collidesWithRect(x, y, PLAYER_CONST.BASE_WIDTH - 10, PLAYER_CONST.BASE_WIDTH - 10);
    }

    private getJumpCost(jumpCoef: number) {
        return jumpCoef * PLAYER_CONST.BASE_JUMP_COST;
    }

    private simulateStep(currentState: BotSimulatedState, action: BotMovementAction): SimplifiedSimulatedBotState {
        const nextState: BotSimulatedState = { // copy
            ...currentState,
            actions: [...currentState.actions, action],
            step: currentState.step + 1,
        };

        const wantsLeft =
            action === BotMovementAction.Left ||
            action === BotMovementAction.JumpLeft;

        const wantsRight =
            action === BotMovementAction.Right ||
            action === BotMovementAction.JumpRight;

        const wantsJump =
            action === BotMovementAction.Jump ||
            action === BotMovementAction.JumpLeft ||
            action === BotMovementAction.JumpRight;


        // HORIZONTAL MOVEMENT
        let targetSpeed = 0;
        const moving = wantsRight || wantsLeft;
        if (moving) {
            nextState.movementLeft -= 1;

            if (wantsRight) {
                targetSpeed = PLAYER_CONST.SPEED;
            } else {
                targetSpeed = -PLAYER_CONST.SPEED;
            }
        }
        nextState.velocityX = targetSpeed;

        if (wantsJump && nextState.movementLeft > 0) {
            nextState.movementLeft -= this.getJumpCost(nextState.jumpCoef);
            nextState.jumpCoef++;
            nextState.velocityY = PLAYER_CONST.JUMP;
        }

        nextState.x += nextState.velocityX;
        nextState.y += nextState.velocityY;
        if (!this.isOnGround(nextState.x, nextState.y)) {
            nextState.y += GRAVITY;
        } else if (nextState.velocityY > 0) {
            nextState.velocityY = 0;
            nextState.jumpCoef = 1;
        }

        const currentSimplifiedState = {
            actions: nextState.actions,
            score: this.calculateScore(nextState),
        }

        if (this.botCollides(nextState.x, nextState.y) || nextState.movementLeft <= 0 || nextState.step > MAX_STEP) {
            return currentSimplifiedState;
        }

        let bestSimplifiedState = currentSimplifiedState;
        ACTIONS.forEach(action => {
            const simplifiedState = this.simulateStep(nextState, action);
            if (simplifiedState.score >= bestSimplifiedState.score) {
                bestSimplifiedState = simplifiedState;
            }
        });

        return bestSimplifiedState;
    }

    private calculateScore(state: BotSimulatedState) {
        //TODO
        let score = 0;

        if (this.fallingToDeath(state.x, state.y)) {
            return -20000;
        }

        score += Math.sqrt(
            (state.x - this.botMemory.botPositionTurnStart.x) ** 2
        );

        score += this.botCollides(state.x, state.y) ? -200    : 0;
        score += this.isOnGround(state.x, state.y) ? 0.25 : 0
        score -= Math.abs(state.velocityY) * 0.2

        return score;
    }
}