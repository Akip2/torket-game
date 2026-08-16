import { ShootInfo } from "@shared/types";
import Bot from "../bodies/Bot";
import { MyRoom } from "../rooms/MyRoom";
import BasicGameAction from "./BasicGameAction";
import { Action } from "@shared/enums/Action.enum";
import { PlayerState } from "@shared/enums/PlayerState.enum";
import { wait } from "@shared/utils";
import { TIME_STEP } from "@shared/const";

export default class BotGameAction extends BasicGameAction {
    private bot: Bot;
    private isListeningToInputs: boolean;

    constructor(room: MyRoom, bot: Bot) {
        super(room);
        this.bot = bot;
        this.isListeningToInputs = false;
    }

    shoot(shootInfo: ShootInfo) {
        this.handleShoot(this.bot.sessionId, shootInfo);
    }

    endTurn() {
        this.handleEndTurn(this.bot.sessionId);
    }

    actionChoice(action: Action) {
        this.handleActionChoice(this.bot.sessionId, action);
    }

    async listenToInputs() {
        if (this.isListeningToInputs) return; // already listening

        this.isListeningToInputs = true;
        while (this.bot.getState() !== PlayerState.Inactive) {
            this.handleInputs(this.bot.playerRef, this.bot.currentInputs);
            await wait(TIME_STEP);
        }
        this.isListeningToInputs = false;
    }
}