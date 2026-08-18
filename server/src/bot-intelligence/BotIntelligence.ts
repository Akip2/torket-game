import { Action } from "@shared/enums/Action.enum";
import Bot from "../bodies/Bot";
import BotGameAction from "../game-action/BotGameAction";
import { MyRoom } from "../rooms/MyRoom";
import BotPerception from "./BotPerception";
import TrajectoryCalculator from "./TrajectoryCalculator";
import BotMemory from "./BotMemory";

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