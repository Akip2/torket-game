import { PLAYER_CONST, TIME_STEP } from "@shared/const";
import { Player } from "../rooms/schema/MyRoomState";
import PlayerServer from "./PlayerServer";
import BotPerception from "../bot-intelligence/BotPerception";
import { InputPayload } from "@shared/types";
import GameActionManager from "../managers/GameActionManager";
import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import { Action } from "@shared/enums/Action.enum";
import { PlayerState } from "@shared/enums/PlayerState.enum";
import { wait } from "@shared/utils";

export default class Bot extends PlayerServer {
    private botPerception: BotPerception;
    private botAction: GameActionManager;
    private currentInputs!: InputPayload;
    private phaseToAction: Map<PhaseTypes, () => void>;

    constructor(
        playerRef: Player,
        sessionId: string,
        onDamage: (hp: number, damage?: number, directHit?: boolean) => void,
        botPerception: BotPerception,
        botAction: GameActionManager,
        size: number = PLAYER_CONST.BASE_WIDTH
    ) {
        super(playerRef, sessionId, onDamage, size);
        this.botPerception = botPerception;
        this.botAction = botAction;
        this.phaseToAction = new Map([
            [PhaseTypes.ActionChoice, () => this.actionChoice()],
            [PhaseTypes.Moving, () => this.move()],
        ]);

        this.resetInputs();
    }

    private resetInputs() {
        this.currentInputs = {
            up: false,
            down: false,
            right: false,
            left: false,

            mousePosition: { x: this.getX(), y: this.getY() },
            timeStamp: 0,
        }
    }

    actionChoice() {
        this.botAction.handleActionChoice(this.sessionId, Action.Move);
    }

    async move() {
        this.currentInputs.right = true;

        while (this.getState() === PlayerState.Moving) {
            this.playerRef.inputQueue.push(this.currentInputs);
            await wait(TIME_STEP);
        }

        this.playerRef.inputQueue.push(this.currentInputs);
    }

    async runAlgo() {
        this.phaseToAction.get(this.botPerception.currentPhase.type)?.();
    }
}