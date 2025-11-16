import type Phase from "@shared/data/phases/Phase";

export default class PhaseManager {
    currentPhase: Phase;

    constructor(currentPhase: Phase) {
        this.currentPhase = currentPhase;
    }
}