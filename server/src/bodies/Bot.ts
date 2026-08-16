import { PLAYER_CONST } from "@shared/const";
import { Player } from "../rooms/schema/MyRoomState";
import PlayerServer from "./PlayerServer";
import BotPerception from "../bot-intelligence/BotPerception";
import { InputPayload } from "@shared/types";
import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import { Action } from "@shared/enums/Action.enum";
import BotGameAction from "../game-action/BotGameAction";
import { MyRoom } from "../rooms/MyRoom";

export default class Bot extends PlayerServer {
    private botPerception: BotPerception;
    private botAction: BotGameAction;
    currentInputs!: InputPayload;
    private phaseToAction: Map<PhaseTypes, () => void>;

    constructor(
        playerRef: Player,
        sessionId: string,
        room: MyRoom,
        onDamage: (hp: number, damage?: number, directHit?: boolean) => void,
        size: number = PLAYER_CONST.BASE_WIDTH
    ) {
        super(playerRef, sessionId, onDamage, size);
        this.phaseToAction = new Map([
            [PhaseTypes.ActionChoice, () => this.actionChoice()],
            [PhaseTypes.Moving, () => this.move()],
        ]);

        this.botPerception = new BotPerception(room.playerManager.getPlayersAlive()[0], room.phaseManager);
        this.botAction = new BotGameAction(room, this);

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

    move() {
        this.currentInputs.right = true;
        this.botAction.listenToInputs();
    }

    async runAlgo() {
        this.phaseToAction.get(this.botPerception.currentPhase.type)?.();
    }
}