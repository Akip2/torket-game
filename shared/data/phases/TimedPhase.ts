import type { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import Phase from "./Phase";

export default class TimedPhase extends Phase {
    startTime: number;
    duration: number;
    endTime: number;

    constructor(type: PhaseTypes, name: string, startTime: number, duration: number, isSolo: boolean = false) {
        super(type, name, true, isSolo);

        this.startTime = startTime;
        this.duration = duration;
        this.endTime = startTime + duration * 1000;
    }

    getTimeLeft() {
        return Math.max(this.endTime - Date.now(), 0);
    }

    isOver() {
        return this.getTimeLeft() === 0;
    }
}