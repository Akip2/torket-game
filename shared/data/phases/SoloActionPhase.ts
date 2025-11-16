import type { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import ActionPhase from "./ActionPhase";

export default class SoloActionPhase extends ActionPhase {
    playerId: string;

    constructor(
        type: PhaseTypes,
        startTime: number,
        duration: number,
        playerConcerned: {
            pseudo: string,
            playerId: string
        }
    ) {
        super(
            type,
            playerConcerned.pseudo + " " + type,
            startTime,
            duration,
            true
        );

        this.playerId = playerConcerned.playerId;
    }
}