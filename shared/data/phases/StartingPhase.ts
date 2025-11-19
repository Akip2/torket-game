import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import TimedPhase from "./TimedPhase";

export default class StartingPhase extends TimedPhase {
    constructor(startTime: number = 0) {
        super(PhaseTypes.Starting, PhaseTypes.Starting, startTime, 10);
    }
}