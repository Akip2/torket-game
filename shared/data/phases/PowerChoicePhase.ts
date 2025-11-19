import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import GlobalActionPhase from "./GlobalActionPhase";

export default class PowerChoicePhase extends GlobalActionPhase {
    constructor(startTime: number = 0) {
        super(PhaseTypes.PowerChoice, startTime, 30);
    }
}