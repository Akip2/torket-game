import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import SoloActionPhase from "./SoloActionPhase";

export default class ActionChoicePhase extends SoloActionPhase {
    constructor(startTime: number, playerConcerned: { pseudo: string, playerId: string }) {
        super(PhaseTypes.ActionChoice, startTime, 15, playerConcerned);
    }
}