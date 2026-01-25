import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";

export default abstract class Phase {
    type: PhaseTypes;
    name: string;
    isTimed: boolean;
    isSolo: boolean;

    constructor(type: PhaseTypes, name: string, isTimed: boolean, isSolo: boolean = false) {
        this.type = type;
        this.name = name;
        this.isTimed = isTimed;
        this.isSolo = isSolo;
    }
}