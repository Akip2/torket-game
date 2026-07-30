import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import SoloActionPhase from "./SoloActionPhase";

export default class ReloadPhase extends SoloActionPhase {
    constructor(startTime: number, playerConcerned: { pseudo: string, playerId: string }) {
        super(PhaseTypes.Reload, startTime, 3, playerConcerned);
    }
}