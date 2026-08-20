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

export default class BotIntelligence {
    private botAction: BotGameAction;
    private botPerception: BotPerception;
    private trajectoryCalculator: TrajectoryCalculator;
    private readonly botMemory: BotMemory;

    constructor(room: MyRoom, bot: Bot) {
        this.botAction = new BotGameAction(room, bot);
        this.botPerception = new BotPerception(room, bot);
        this.trajectoryCalculator = new TrajectoryCalculator();
        this.botMemory = new BotMemory();
    }

    async shootCalculatedTrajectory() {
        const shootInfo = this.botMemory.bestTrajectory.shootInfo;
        
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

    memorizeBestTrajectory() {
        const bestTrajectory = this.trajectoryCalculator.findBestTrajectory(
            this.botPerception.selfPosition,
            this.botPerception.otherPlayerPosition,
            this.botPerception.terrain,
            this.botPerception.selfBulletCount
        );

        this.botMemory.bestTrajectory = bestTrajectory;
    }
}