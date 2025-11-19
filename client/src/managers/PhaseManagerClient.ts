import type Phase from "@shared/data/phases/Phase";

export default class PhaseManagerClient {
    currentPhase: Phase;

    constructor(currentPhase: Phase) {
        this.currentPhase = currentPhase;
    }
}