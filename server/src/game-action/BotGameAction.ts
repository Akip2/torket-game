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

    moveRight() {
        this.bot.currentInputs.right = true;
        this.bot.currentInputs.left = false;
    }

    moveLeft() {
        this.bot.currentInputs.left = true;
        this.bot.currentInputs.right = false;
    }

    async moveMouse(x: number, y: number) {
        const startX = this.bot.currentInputs.mousePosition.x;
        const startY = this.bot.currentInputs.mousePosition.y;

        const steps = Math.min(20, Math.random() * 120);

        for (let i = 1; i <= steps; i++) {
            const t = i / steps;

            this.bot.currentInputs.mousePosition.x =
                Math.round(startX + (x - startX) * t);

            this.bot.currentInputs.mousePosition.y =
                Math.round(startY + (y - startY) * t);

            await wait(TIME_STEP);
        }
    }

    jump() {
        this.bot.currentInputs.up = true;
    }

    stopHorizontalMovement() {
        this.bot.currentInputs.left = false;
        this.bot.currentInputs.right = false;
    }

    stopJumping() {
        this.bot.currentInputs.up = false;
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