import { PLAYER_CONST } from "@shared/const";
import { Player } from "../rooms/schema/MyRoomState";
import PlayerServer from "./PlayerServer";
import BotPerception from "../bot-intelligence/BotPerception";

export default class Bot extends PlayerServer {
    private botPerception: BotPerception;

    constructor(playerRef: Player, sessionId: string, onDamage: (hp: number, damage?: number, directHit?: boolean) => void, botPerception: BotPerception, size: number = PLAYER_CONST.BASE_WIDTH) {
        super(playerRef, sessionId, onDamage, size);
        this.botPerception = botPerception;
    }

    runAlgo() {
        //TODO
        console.log("BOT TURN");
    }
}