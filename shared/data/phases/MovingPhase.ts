import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import SoloActionPhase from "./SoloActionPhase";

export default class MovingPhase extends SoloActionPhase {
    constructor(startTime: number, playerConcerned: { pseudo: string, playerId: string }) {
        super(PhaseTypes.Moving, startTime, 30, playerConcerned);
    }
}