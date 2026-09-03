import QuadBlock from "@shared/data/QuadBlock";
import { BotMovementAction } from "../../enums/BotMovementAction.enum";
import { BOT_CONST, GRAVITY, PLAYER_CONST } from "@shared/const";
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
    BotMovementAction.Right,
    BotMovementAction.Left,
    BotMovementAction.Jump,
];

const MAX_STEP = 8;
export default class MovementCalculator {
    constructor(
        private botPerception: BotPerception, 
        private botMemory: BotMemory, 
        private terrain: QuadBlock, 
        private trajectoryCalculator: TrajectoryCalculator
    ) {}

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
            PLAYER_CONST.BASE_WIDTH - 8,
            700
        );
    }

    private botCollides(x: number, y: number) {
        return this.terrain.collidesWithRect(
            x, 
            y, 
            PLAYER_CONST.BASE_WIDTH - 8, 
            PLAYER_CONST.BASE_WIDTH - 8
        );
    }

    private resolveCollision(state: BotSimulatedState): { resolved: boolean; newX: number; newY: number; newVelX: number; newVelY: number } {
        if (!this.botCollides(state.x, state.y)) {
            return { resolved: false, newX: state.x, newY: state.y, newVelX: state.velocityX, newVelY: state.velocityY };
        }

        const width = PLAYER_CONST.BASE_WIDTH - 8;
        const oldX = state.x;
        const oldY = state.y;

        let newX = state.x;
        let newY = state.y;
        let newVelX = state.velocityX;
        let newVelY = state.velocityY;

        for (let offset = 1; offset <= 32; offset += 2) {
            const testY = state.y - offset;
            if (!this.terrain.collidesWithRect(state.x, testY, width, width)) {
                newY = testY;
                newVelY = Math.min(0, state.velocityY);
                return { resolved: true, newX, newY, newVelX, newVelY };
            }
        }

        for (let offset = 1; offset <= 32; offset += 2) {
            const testY = state.y + offset;
            if (!this.terrain.collidesWithRect(state.x, testY, width, width)) {
                newY = testY;
                newVelY = Math.max(0, state.velocityY);
                return { resolved: true, newX, newY, newVelX, newVelY };
            }
        }

        for (let offset = 1; offset <= 32; offset += 2) {
            const testX = state.x - offset;
            if (!this.terrain.collidesWithRect(testX, state.y, width, width)) {
                newX = testX;
                newVelX = 0;
                return { resolved: true, newX, newY, newVelX, newVelY };
            }
        }

        for (let offset = 1; offset <= 32; offset += 2) {
            const testX = state.x + offset;
            if (!this.terrain.collidesWithRect(testX, state.y, width, width)) {
                newX = testX;
                newVelX = 0;
                return { resolved: true, newX, newY, newVelX, newVelY };
            }
        }

        return { resolved: false, newX: oldX, newY: oldY, newVelX: 0, newVelY: 0 };
    }

    private simulateStep(currentState: BotSimulatedState, action: BotMovementAction): SimplifiedSimulatedBotState {
        const nextState: BotSimulatedState = {
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
            tickNumber = BOT_CONST.SIMULATION_STEP_TIME_COEF;
            if (moving) {
                if (wantsRight) {
                    targetSpeed = PLAYER_CONST.SPEED;
                } else {
                    targetSpeed = -PLAYER_CONST.SPEED;
                }
            }
        }
        nextState.velocityX = targetSpeed;
        nextState.velocityX *= 0.95;

        this.simulatePhysics(nextState, tickNumber);

        const collision = this.resolveCollision(nextState);
        if (collision.resolved) {
            nextState.x = collision.newX;
            nextState.y = collision.newY;
            nextState.velocityX = collision.newVelX;
            nextState.velocityY = collision.newVelY;
        }

        const currentSimplifiedState = {
            actions: nextState.actions,
            score: this.calculateScore(nextState),
        };

        if (nextState.movementLeft <= 0 || nextState.step > MAX_STEP) {
            return currentSimplifiedState;
        }

        if (this.botCollides(nextState.x, nextState.y)) {
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
        let score = 0;

        if (this.fallingToDeath(state.x, state.y)) {
            return -20000;
        }

        score -= Math.sqrt(
            (state.x - this.botPerception.otherPlayerPosition.x) ** 2
            +
            (state.y - this.botPerception.otherPlayerPosition.y) ** 2
        );

        score += ((state.x - this.botPerception.selfPosition.x) ** 2) * 0.0225;

        score += this.isOnGround(state.x, state.y) ? 0.1 : 0;

        return score;
    }
}