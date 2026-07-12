import type Phase from "@shared/data/phases/Phase";
import TimedPhase from "@shared/data/phases/TimedPhase";
import WaitingPhase from "@shared/data/phases/WaitingPhase";
import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import type SoloActionPhase from "@shared/data/phases/SoloActionPhase";

export default class PhaseManagerClient {
    currentPhase: Phase;
    concernedPlayerId: string | null = null;

    constructor() {
        this.currentPhase = new WaitingPhase();
    }

    setCurrentPhase(phase: Phase) {
        if (phase.isTimed) {
            if (phase.isSolo) {
                this.concernedPlayerId = (phase as SoloActionPhase).playerId;
            } else {
                this.concernedPlayerId = null;
            }

            const timedPhaseCast = phase as TimedPhase;
            this.currentPhase = new TimedPhase(timedPhaseCast.type, timedPhaseCast.name, Date.now(), timedPhaseCast.duration);
        } else {
            this.currentPhase = phase;
        }
    }

    isActionChoicePhase(): boolean {
        return this.currentPhase.type === PhaseTypes.ActionChoice;
    }

    isConcerned(playerId: string): boolean {
        return this.concernedPlayerId ? this.concernedPlayerId === playerId : true;
    }

    updateDisplay() {
        const nameEl = document.getElementById("phase-name");
        const timerEl = document.getElementById("phase-timer");

        if (nameEl) nameEl.textContent = this.currentPhase.name;

        if (timerEl && this.currentPhase.isTimed) {
            const timeLeft = (this.currentPhase as TimedPhase).getTimeLeft();
            timerEl.textContent = `${Math.ceil(timeLeft / 1000)}s`;
        } else if (timerEl) {
            timerEl.textContent = "";
        }
    }
}