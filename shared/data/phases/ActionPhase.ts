import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import TimedPhase from "./TimedPhase";

export default class ActionPhase extends TimedPhase {
    static TYPES = [
        PhaseTypes.ActionChoice,
        PhaseTypes.PowerChoice,
        PhaseTypes.Moving,
        PhaseTypes.Shooting
    ];

    constructor(
        type: PhaseTypes,
        name: string,
        startTime: number,
        duration: number,
        isSolo: boolean
    ) {
        super(
            type,
            name,
            startTime,
            duration,
            isSolo
        );
    }
}