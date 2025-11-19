import type Phase from "@shared/data/phases/Phase";
import WaitingPhase from "@shared/data/phases/WaitingPhase";

export default class PhaseManagerClient {
    currentPhase: Phase;

    constructor() {
        this.currentPhase = new WaitingPhase();
    }
}