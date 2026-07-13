import type Phase from "@shared/data/phases/Phase";
import TimedPhase from "@shared/data/phases/TimedPhase";
import WaitingPhase from "@shared/data/phases/WaitingPhase";
import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import type SoloActionPhase from "@shared/data/phases/SoloActionPhase";

export default class PhaseManagerClient {
    currentPhase: Phase;
    concernedPlayerId: string | null = null;

    private lastDisplayedPhase?: Phase;
    private dotCount: number = 0;
    private lastDotUpdateTime: number = 0;

    private nameEl: HTMLElement;
    private timerEl: HTMLElement;

    constructor() {
        this.currentPhase = new WaitingPhase();

        this.nameEl = document.getElementById("phase-name")!;
        this.timerEl = document.getElementById("phase-timer")!;
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
        if (this.currentPhase.isTimed || this.currentPhase != this.lastDisplayedPhase) {
            this.lastDisplayedPhase = this.currentPhase;

            this.nameEl.textContent = this.currentPhase.name;

            if (this.currentPhase.isTimed) {
                const timeLeft = (this.currentPhase as TimedPhase).getTimeLeft();
                this.timerEl.textContent = `${Math.ceil(timeLeft / 1000)}s`;
            } else {
                this.timerEl.textContent = "";
            }
        }

        if (this.currentPhase.type === PhaseTypes.Waiting) {
            this.animateWaitingPhase();
        }
    }

    private animateWaitingPhase() {
        const currentTime = Date.now();

        if (currentTime - this.lastDotUpdateTime >= 500) {
            this.lastDotUpdateTime = currentTime;
            this.dotCount = (this.dotCount + 1) % 4;

            const dots = '.'.repeat(this.dotCount);
            const spaces = ' '.repeat(3 - this.dotCount);
            this.nameEl.innerHTML = `${this.currentPhase.name}<span class="dots">${dots}</span>`;
        }
    }
}