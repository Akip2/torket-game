import { Action } from "@shared/enums/Action.enum";
import Bot from "../bodies/Bot";
import BotGameAction from "../game-action/BotGameAction";
import { MyRoom } from "../rooms/MyRoom";
import BotPerception from "./BotPerception";

export default class BotIntelligence {
    private botAction: BotGameAction;
    private botPerception: BotPerception;

    constructor(room: MyRoom, bot: Bot) {
        this.botAction = new BotGameAction(room, bot);
        this.botPerception = new BotPerception(room, bot);
    }

    chooseAction(action: Action) {
        this.botAction.actionChoice(action);
    }

    endTurn() {
        this.botAction.endTurn();
    }
}