import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import NonTimedPhase from "./NonTimedPhase";

export default class GameEndPhase extends NonTimedPhase {
    constructor() {
        super(PhaseTypes.GameEnd, PhaseTypes.GameEnd);
    }
}