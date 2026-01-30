import type { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import Phase from "./Phase";

export default abstract class NonTimedPhase extends Phase {
    constructor(type: PhaseTypes, name: string) {
        super(type, name, false);
    }
}