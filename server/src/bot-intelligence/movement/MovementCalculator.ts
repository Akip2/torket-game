import QuadBlock from "@shared/data/QuadBlock";
import { BotMovementAction } from "../../enums/BotMovementAction.enum";
import { GRAVITY, PLAYER_CONST, SIMULATION_STEP_TIME_COEF, TIME_STEP } from "@shared/const";
import TrajectoryCalculator from "../TrajectoryCalculator";
import BotPerception from "../BotPerception";
import BotMemory from "../BotMemory";

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

const MAX_STEP = 8;
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
        return this.terrain.collidesWithRect(x, y, PLAYER_CONST.BASE_WIDTH - 8, PLAYER_CONST.BASE_WIDTH - 8);
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
        let tickNumber = 1;
        if (wantsJump) {
            nextState.velocityY = PLAYER_CONST.JUMP;
        } else {
            tickNumber = SIMULATION_STEP_TIME_COEF;
            if (moving) {
                if (wantsRight) {
                    targetSpeed = PLAYER_CONST.SPEED;
                } else {
                    targetSpeed = -PLAYER_CONST.SPEED;
                }
            }
        }
        nextState.velocityX = targetSpeed;

        this.simulatePhysics(nextState, tickNumber);

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

    private simulatePhysics(state: BotSimulatedState, tickNumber: number) {
        const currentAction = state.actions[state.actions.length - 1];

        let movementDecrease = 0;

        if (
            currentAction === BotMovementAction.Left ||
            currentAction === BotMovementAction.Right
        ) {
            movementDecrease = 1;
        } else if (currentAction === BotMovementAction.Jump) {
            movementDecrease = PLAYER_CONST.BASE_JUMP_COST * state.jumpCoef;
        }

        const frictionFactor = 1 - 0.05;

        for (let i = 0; i < tickNumber; i++) {
            // Air friction
            //state.velocityX *= frictionFactor;
            state.velocityY *= frictionFactor;

            // Gravity
            if (!this.isOnGround(state.x, state.y)) {
                state.velocityY += GRAVITY;
            } else if (state.velocityY > 0) {
                state.velocityY = 0;
                state.jumpCoef = 1;
            }

            // Position
            state.x += state.velocityX;
            state.y += state.velocityY;

            state.movementLeft -= movementDecrease;
        }
    }

    private calculateScore(state: BotSimulatedState) {
        //TODO
        let score = 0;

        if (this.fallingToDeath(state.x, state.y)) {
            return -20000;
        }

        if (this.botCollides(state.x, state.y)) {
            return -10000;
        }
        /*
                score += Math.sqrt(
                    (state.x - this.botMemory.botPositionTurnStart.x) ** 2
                );
                */

        score -= Math.sqrt(
            (state.x - this.botPerception.otherPlayerPosition.x) ** 2
            +
            (state.y - this.botPerception.otherPlayerPosition.y) ** 2
        );

        //score += this.isOnGround(state.x, state.y) ? 0.25 : 0
        score += Math.min(0, state.velocityY) * 0.2
        // score -= state.step > 2 ? state.movementLeft / 10 : 2;
        score += this.isOnGround(state.x, state.y) ? 0.1 : -10 / state.movementLeft

        return score;
    }
}