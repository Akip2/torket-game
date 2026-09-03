import { Action } from "@shared/enums/Action.enum";
import Bot from "../bodies/Bot";
import BotGameAction from "../game-action/BotGameAction";
import { MyRoom } from "../rooms/MyRoom";
import BotPerception from "./BotPerception";
import TrajectoryCalculator from "./TrajectoryCalculator";
import BotMemory from "./BotMemory";
import { wait } from "@shared/utils";
import { SHOT_CONST, BOT_CONST, TIME_STEP } from "@shared/const";
import { Position } from "@shared/types";
import MovementCalculator from "./movement/MovementCalculator";
import { BotMovementAction } from "../enums/BotMovementAction.enum";

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
        this.botMemory = new BotMemory();
        this.movementCalculator = new MovementCalculator(this.botPerception, this.botMemory, room.terrainManager.root, this.trajectoryCalculator);
    }

    async shootCalculatedTrajectory() {
        const forceImprecision = BOT_CONST.SHOT_IMPRECISION_COEF * Math.random();
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

    async playMemorizedMovements() {
        for (let i = 0; i < this.botMemory.bestMovements.length; i++) {
            const currentMovement = this.botMemory.bestMovements[i];
            const wantsleft = currentMovement === BotMovementAction.JumpLeft || currentMovement === BotMovementAction.Left;
            const wantsRight = currentMovement === BotMovementAction.JumpRight || currentMovement === BotMovementAction.Right;
            const wantsJump = currentMovement === BotMovementAction.Jump || currentMovement === BotMovementAction.JumpRight || currentMovement === BotMovementAction.JumpLeft;


            if (wantsJump) {
                this.botAction.jump();

                await wait(TIME_STEP);
            } else {
                this.botAction.stopJumping();

                if (wantsleft) {
                    this.botAction.moveLeft();
                } else if (wantsRight) {
                    this.botAction.moveRight();
                } else {
                    this.botAction.stopHorizontalMovement();
                }


                await wait(TIME_STEP * BOT_CONST.SIMULATION_STEP_TIME_COEF);
            }
        }
    }

    memorizeBestTrajectory(origin: Position, target: Position) {
        const bestTrajectory = this.trajectoryCalculator.findBestTrajectory(
            origin,//this.botPerception.selfPosition,
            target,//this.botPerception.otherPlayerPosition,
            this.botPerception.terrain,
            this.botPerception.selfBulletCount
        );

        this.botMemory.bestTrajectory = bestTrajectory;
    }

    memorizeBestMovements() {
        const bestMovements = this.movementCalculator.findBestMovements();
        this.botMemory.bestMovements = bestMovements;
    }

    memorizeBotPosition() {
        this.botMemory.botPositionTurnStart = {
            x: this.botPerception.selfPosition.x,
            y: this.botPerception.selfPosition.y
        };
    }
}