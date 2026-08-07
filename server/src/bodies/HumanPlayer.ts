import { PLAYER_CONST } from "@shared/const";
import { Player } from "../rooms/schema/MyRoomState";
import PlayerServer from "./PlayerServer";

export default class HumanPlayer extends PlayerServer {
    constructor(playerRef: Player, sessionId: string, onDamage: (hp: number, damage?: number, directHit?: boolean) => void, size: number = PLAYER_CONST.BASE_WIDTH) {
        super(playerRef, sessionId, onDamage, size);
    }
}