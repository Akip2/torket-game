import type { PhaseTypes } from "@shared/enums/PhaseTypes.enum";

export default abstract class Phase {
    type: PhaseTypes;
    name: string;
    isTimed: boolean;

    constructor(type: PhaseTypes, name: string, isTimed: boolean) {
        this.type = type;
        this.name = name;
        this.isTimed = isTimed;
    }
}