import type { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import ActionPhase from "./ActionPhase";

export default class GlobalActionPhase extends ActionPhase {
    constructor(
        type: PhaseTypes,
        startTime: number,
        duration: number,
    ) {
        super(
            type,
            type,
            startTime,
            duration,
            false
        );
    }
}