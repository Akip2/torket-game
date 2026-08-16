import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import TimedPhase from "./TimedPhase";
import { DEBUG } from "@shared/const";

export default class StartingPhase extends TimedPhase {
    constructor(startTime: number = 0) {
        super(PhaseTypes.Starting, PhaseTypes.Starting, startTime, DEBUG ? 1 : 10);
    }
}