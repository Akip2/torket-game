import Phase from "@shared/data/phases/Phase";
import PlayerManagerServer from "./PlayerManagerServer";
import WaitingPhase from "@shared/data/phases/WaitingPhase";
import StartingPhase from "@shared/data/phases/StartingPhase";
import TimedPhase from "@shared/data/phases/TimedPhase";
import PowerChoicePhase from "@shared/data/phases/PowerChoicePhase";
import ActionChoicePhase from "@shared/data/phases/ActionChoicePhase";
import SoloActionPhase from "@shared/data/phases/SoloActionPhase";

export default class PhaseManagerServer {
    currentIndex: number = 0;
    currentPhase: Phase = new WaitingPhase();
    phases: Phase[] = [];
    playerManager: PlayerManagerServer;
    timeOut: NodeJS.Timeout;
    onPhaseChange: (phase: Phase) => void;

    constructor(playerManager: PlayerManagerServer, onPhaseChange: (phase: Phase) => void) {
        this.playerManager = playerManager;
        this.onPhaseChange = onPhaseChange;
    }

    start() {
        this.phases = [new PowerChoicePhase()];
        this.playerManager.playerBodies.forEach((playerBody, id) => {
            this.phases.push(
                new ActionChoicePhase(0, {
                    pseudo: playerBody.playerRef.pseudo,
                    playerId: id
                })
            );
        });

        const startingPhase = new StartingPhase(Date.now())
        this.setCurrentPhase(startingPhase);
    }

    stop() {
        clearTimeout(this.timeOut);
    }

    reset() {
        this.setCurrentPhase(new WaitingPhase());
        this.phases = [];
        this.currentIndex = 0;
    }

    setCurrentPhase(phase: Phase) {
        clearTimeout(this.timeOut);

        if (phase instanceof TimedPhase) {
            (phase as TimedPhase).startTime = Date.now();
            this.timeOut = setTimeout(() => this.next(), (phase as TimedPhase).duration * 1000);
        }

        this.currentPhase = phase;
        this.onPhaseChange(phase);
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.phases.length;

        const phase = this.phases[this.currentIndex];

        if (phase instanceof SoloActionPhase && !this.playerManager.getPlayer(phase.playerId)?.playerRef.isAlive) { // trying to do the action of a dead player
            this.phases.splice(this.currentIndex, 1); // removing the phase
            this.currentIndex--; // staying at the same index for the next phase
            this.next();
        } else {
            this.setCurrentPhase(phase);
        }
    }
}