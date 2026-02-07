import Phase from "@shared/data/phases/Phase";
import PlayerManagerServer from "./PlayerManagerServer";
import WaitingPhase from "@shared/data/phases/WaitingPhase";
import StartingPhase from "@shared/data/phases/StartingPhase";
import TimedPhase from "@shared/data/phases/TimedPhase";
import ActionChoicePhase from "@shared/data/phases/ActionChoicePhase";
import SoloActionPhase from "@shared/data/phases/SoloActionPhase";
import { Action } from "@shared/enums/Action.enum";
import ShootingPhase from "@shared/data/phases/ShootingPhase";
import MovingPhase from "@shared/data/phases/MovingPhase";
import { wait } from "@shared/utils";
import PlayerServer from "src/bodies/PlayerServer";
import { PlayerState } from "@shared/enums/PlayerState.enum";
import GameEndPhase from "@shared/data/phases/GameEndPhase";
import { FREE_ROAM } from "@shared/const";

export default class PhaseManagerServer {
    currentIndex: number = -1;
    currentPhase: Phase = new WaitingPhase();
    phases: Phase[] = [];
    playerManager: PlayerManagerServer;
    timeOut: NodeJS.Timeout;
    concernedPlayerId: string;
    onPhaseChange: (phase: Phase) => void;

    constructor(playerManager: PlayerManagerServer, onPhaseChange: (phase: Phase) => void) {
        this.playerManager = playerManager;
        this.onPhaseChange = onPhaseChange;
    }

    start() {
        this.phases = [];
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
        this.currentIndex = -1;
    }

    setCurrentPhase(phase: Phase) {
        clearTimeout(this.timeOut);

        if (phase instanceof TimedPhase) {
            (phase as TimedPhase).startTime = Date.now();
            this.timeOut = setTimeout(() => this.next(), (phase as TimedPhase).duration * 1000);
        }

        if (phase.isSolo) {
            this.concernedPlayerId = (phase as SoloActionPhase).playerId;
        } else {
            this.concernedPlayerId = null;
        }

        if(!FREE_ROAM) this.playerManager.handlePlayersState(phase);

        this.currentPhase = phase;
        this.onPhaseChange(phase);
    }

    async next(delay: number = 0) {
        clearTimeout(this.timeOut);

        await wait(delay);

        if (this.isOver()) return;
        
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

    async endTurn(playerId: string) {
        if (playerId !== this.concernedPlayerId) return;

        clearTimeout(this.timeOut);
        await wait(250);
        this.next();
    }

    actionChoice(playerId: string, action: Action) {
        if (playerId !== this.concernedPlayerId) return;
        
        const player = this.playerManager.getPlayer(playerId);

        if (action === Action.Move) {
            this.setCurrentPhase(new MovingPhase(Date.now(), {
                pseudo: player.playerRef.pseudo,
                playerId: playerId
            }));
        } else if (action === Action.Shoot) {
            this.setCurrentPhase(new ShootingPhase(Date.now(), {
                pseudo: player.playerRef.pseudo,
                playerId: playerId
            }));
        }
    }

    isConcerned(playerId: string) {
        return this.currentPhase.isSolo
            ? this.concernedPlayerId === playerId
            : this.concernedPlayerId === playerId || this.concernedPlayerId === null;
    }

    disableAction(playerBody: PlayerServer) {
        clearTimeout(this.timeOut);
        if(FREE_ROAM) return;
        playerBody.setState(PlayerState.Inactive);
        this.concernedPlayerId = null;
    }

    endGame() {
        clearTimeout(this.timeOut);
        this.setCurrentPhase(new GameEndPhase());
    }

    isOver() {
        return this.currentPhase instanceof GameEndPhase;
    }
}