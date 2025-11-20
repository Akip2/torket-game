import type Phase from "@shared/data/phases/Phase";
import TimedPhase from "@shared/data/phases/TimedPhase";
import WaitingPhase from "@shared/data/phases/WaitingPhase";

export default class PhaseManagerClient {
    currentPhase: Phase;

    constructor() {
        this.currentPhase = new WaitingPhase();
    }

    setCurrentPhase(phase: Phase) {
        if (phase.isTimed) {
            const timedPhaseCast = phase as TimedPhase; 
            this.currentPhase = new TimedPhase(timedPhaseCast.type, timedPhaseCast.name, timedPhaseCast.startTime, timedPhaseCast.duration);
        } else {
            this.currentPhase = phase;
        }
    }
}