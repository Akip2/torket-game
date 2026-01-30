import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import NonTimedPhase from "./NonTimedPhase";

export default class WaitingPhase extends NonTimedPhase {
    constructor() {
        super(PhaseTypes.Waiting, PhaseTypes.Waiting);
    }
}