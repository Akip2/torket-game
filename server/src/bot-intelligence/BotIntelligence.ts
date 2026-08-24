import { Action } from "@shared/enums/Action.enum";
import Bot from "../bodies/Bot";
import BotGameAction from "../game-action/BotGameAction";
import { MyRoom } from "../rooms/MyRoom";
import BotPerception from "./BotPerception";
import TrajectoryCalculator from "./TrajectoryCalculator";
import BotMemory from "./BotMemory";
import { wait } from "@shared/utils";
import { SHOT_CONST, TIME_STEP } from "@shared/const";
import { Position } from "@shared/types";
import MovementCalculator from "./MovementCalculator";
import { BotMovementAction } from "@shared/enums/BotMovementAction.enum";

export default class BotIntelligence {
    private botAction: BotGameAction;
    private botPerception: BotPerception;
    private trajectoryCalculator: TrajectoryCalculator;
    private movementCalculator: MovementCalculator;
    private readonly botMemory: BotMemory;

    constructor(room: MyRoom, bot: Bot) {
        this.botAction = new BotGameAction(room, bot);
        this.botPerception = new BotPerception(room, bot);
        this.trajectoryCalculator = new TrajectoryCalculator();
        this.movementCalculator = new MovementCalculator(this.botPerception, room.terrainManager.root, this.trajectoryCalculator);
        this.botMemory = new BotMemory();
    }

    async shootCalculatedTrajectory(forceImprecision: number = 0) {
        const shootInfo = this.botMemory.bestTrajectory.shootInfo;

        // FORCE IMPRECISION
        const currentForce = shootInfo.force;
        const sign = Math.random() > 0.5 ? 1 : 0;
        let newForce = currentForce + sign * forceImprecision
        if (newForce < SHOT_CONST.MIN_SHOT_FORCE || newForce > SHOT_CONST.BASE_MAX_SHOT_FORCE) {
            newForce = currentForce - sign * forceImprecision
        }
        shootInfo.force = newForce;

        await this.botAction.moveMouse(shootInfo.targetX, shootInfo.targetY);
        const chargingTime = (shootInfo.force / (SHOT_CONST.BASE_MAX_SHOT_FORCE / 100)) * TIME_STEP;

        await wait(chargingTime);
        this.botAction.shoot(shootInfo);
    }

    chooseAction(action: Action) {
        this.botAction.actionChoice(action);
    }

    endTurn() {
        this.botAction.endTurn();
    }

    getBotMemory() {
        return this.botMemory;
    }

    getBotPerception() {
        return this.botPerception;
    }

    listenToInputs() {
        this.botAction.listenToInputs();
    }

    async moveTowards(pos: Position) {
        while (this.botPerception.selfMovementLeft > 0) {
            if (this.botPerception.selfPosition.x < pos.x) {
                this.botAction.moveRight();
            } else {
                this.botAction.moveLeft();
            }

            await wait(TIME_STEP);
        }
    }

    async playMemorizedMovements() {
        for (let i = 0; i < this.botMemory.bestMovements.length; i++) {
            const currentMovement = this.botMemory.bestMovements[i];
            const wantsleft = currentMovement === BotMovementAction.JumpLeft || currentMovement === BotMovementAction.Left;
            const wantsRight = currentMovement === BotMovementAction.JumpRight || currentMovement === BotMovementAction.Right;
            const wantsJump = currentMovement === BotMovementAction.Jump || currentMovement === BotMovementAction.JumpRight || currentMovement === BotMovementAction.JumpLeft;

            if (wantsleft) {
                this.botAction.moveLeft();
            } else if (wantsRight) {
                this.botAction.moveRight();
            } else {
                this.botAction.stopHorizontalMovement();
            }

            if (wantsJump) {
                this.botAction.jump();
            } else {
                this.botAction.stopJumping();
            }

            await wait(TIME_STEP);
        }
    }

    memorizeBestTrajectory() {
        const bestTrajectory = this.trajectoryCalculator.findBestTrajectory(
            this.botPerception.selfPosition,
            this.botPerception.otherPlayerPosition,
            this.botPerception.terrain,
            this.botPerception.selfBulletCount
        );

        this.botMemory.bestTrajectory = bestTrajectory;
    }

    memorizeBestMovements() {
        const bestMovements = this.movementCalculator.findBestMovements();
        this.botMemory.bestMovements = bestMovements;
    }
}