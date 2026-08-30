import QuadBlock from "@shared/data/QuadBlock";
import { BotMovementAction } from "@shared/enums/BotMovementAction.enum";
import { GRAVITY, PLAYER_CONST, SIMULATION_STEP_TIME_COEF, TIME_STEP } from "@shared/const";
import TrajectoryCalculator from "../TrajectoryCalculator";
import BotPerception from "../BotPerception";
import BotMemory from "../BotMemory";
import PriorityQueue from "./PriorityQueue";

type BotSimulatedState = {
    x: number;
    y: number;

    velocityX: number;
    velocityY: number;

    movementLeft: number;
    actions: BotMovementAction[];
    jumpCoef: number;
    heuristic: number;
    cost: number;
    step: number;
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
export default class MovementCalculatorAStar {
    constructor(private botPerception: BotPerception, private botMemory: BotMemory, private terrain: QuadBlock, private trajectoryCalculator: TrajectoryCalculator) {

    }

    findBestMovements() {
        const startState: BotSimulatedState = {
            x: this.botPerception.selfPosition.x,
            y: this.botPerception.selfPosition.y,

            velocityX: this.botPerception.selfVelocity.x,
            velocityY: this.botPerception.selfVelocity.y,

            movementLeft: this.botPerception.selfMovementLeft,
            actions: [],
            jumpCoef: 1,
            step: 0,
            cost: 0,
            heuristic: 0,
        };
        startState.heuristic = this.calculateHeuristic(startState);

        return this.search(startState)?.actions;//this.simulateStep(startState, BotMovementAction.None).actions;
    }

    private compareStates(state1: BotSimulatedState, state2: BotSimulatedState) {
        return state1.heuristic - state2.heuristic;
    }

    private search(startState: BotSimulatedState) {
        const visited = new Set<string>();
        const openQueue = new PriorityQueue(this.compareStates);
        openQueue.enqueue(startState);

        while (openQueue.length > 0) {
            const currentState = openQueue.getElement();

            if (this.isGoalReached(currentState)) {
                return currentState;
            }

            const stateKey = this.getStateKey(currentState);
            if (visited.has(stateKey)) {
                continue;
            } else {
                visited.add(stateKey);
            }

            if (currentState.movementLeft > 0 && !this.botCollides(currentState.x, currentState.y)) {
                ACTIONS.forEach(action => {
                    openQueue.enqueue(this.doAction(currentState, action));
                });
            }
        }
    }

    private isGoalReached(state: BotSimulatedState) {
        const playerPos = this.botPerception.otherPlayerPosition;
        const dist = Math.sqrt(
            (state.x - playerPos.x) ** 2
            +
            (state.y - playerPos.y) ** 2
        );

        return dist < 100;
    }

    private getStateKey(state: BotSimulatedState): string {
        return [
            Math.round(state.x),
            Math.round(state.y),
            Math.round(state.movementLeft),
        ].join(",");
    }

    private isOnGround(x: number, y: number): boolean {
        return this.terrain.collidesWithRect(
            x,
            y + (PLAYER_CONST.BASE_WIDTH / 2),
            1,
            1
        );
    }

    private botCollides(x: number, y: number) {
        return this.terrain.collidesWithRect(x, y, PLAYER_CONST.BASE_WIDTH - 8, PLAYER_CONST.BASE_WIDTH - 8);
    }

    private doAction(currentState: BotSimulatedState, action: BotMovementAction): BotSimulatedState {
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
        if (wantsJump) {
            nextState.velocityY = PLAYER_CONST.JUMP;
            nextState.jumpCoef++;
        } else {
            if (moving) {
                if (wantsRight) {
                    targetSpeed = PLAYER_CONST.SPEED;
                } else {
                    targetSpeed = -PLAYER_CONST.SPEED;
                }
            }
        }
        nextState.velocityX = targetSpeed;
        this.simulatePhysics(nextState);

        this.updateCost(nextState);
        this.updateHeuristic(nextState);

        return nextState;
    }

    private simulatePhysics(state: BotSimulatedState) {
        const currentAction = state.actions[state.actions.length - 1];
        let movementDecrease = 0;

        if (currentAction === BotMovementAction.Left || currentAction === BotMovementAction.Right) {
            movementDecrease = 1;
        } else if (currentAction === BotMovementAction.Jump) {
            movementDecrease = PLAYER_CONST.BASE_JUMP_COST * state.jumpCoef;
        }

        state.x += state.velocityX;
        state.y += state.velocityY;
        if (!this.isOnGround(state.x, state.y)) {
            state.y += GRAVITY;
        } else if (state.velocityY > 0) {
            state.velocityY = 0;
            state.jumpCoef = 1;
        }

        state.movementLeft -= movementDecrease;
    }

    private updateCost(state: BotSimulatedState) {
        const lastAction = state.actions[state.actions.length - 1];
        let additionalCost = 0;
        if (lastAction === BotMovementAction.Left || lastAction === BotMovementAction.Right) {
            additionalCost += 1;
        } else if (lastAction === BotMovementAction.Jump) {
            additionalCost += PLAYER_CONST.BASE_JUMP_COST * state.jumpCoef;
        }

        state.cost += additionalCost;
    }

    private updateHeuristic(state: BotSimulatedState) {
        state.heuristic = state.cost + this.calculateHeuristic(state);
    }

    private calculateHeuristic(state: BotSimulatedState) {
        const playerPos = this.botPerception.otherPlayerPosition;
        const distX = Math.abs(state.x - playerPos.x);
        const distY = Math.max(0, state.y - playerPos.y) / Math.abs(PLAYER_CONST.JUMP);

        return distX + distY;
    }
}