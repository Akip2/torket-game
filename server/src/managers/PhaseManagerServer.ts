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
import PlayerServer from "../bodies/PlayerServer";
import { PlayerState } from "@shared/enums/PlayerState.enum";
import GameEndPhase from "@shared/data/phases/GameEndPhase";
import { FREE_ROAM } from "@shared/const";
import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import { immobilizePlayer } from "@shared/logics/player-logic";
import ReloadPhase from "@shared/data/phases/ReloadPhase";
import ActionPhase from "@shared/data/phases/ActionPhase";
import Bot from "../bodies/Bot";
import { isBotId } from "../server-utils";

export default class PhaseManagerServer {
    private currentIndex: number = -1;
    private currentPhase: Phase = new WaitingPhase();
    private phases: Phase[] = [];
    private playerManager: PlayerManagerServer;
    private timeOut?: NodeJS.Timeout;
    private concernedPlayerId: string | null = null;
    private onPhaseChange: (phase: Phase) => void;
    private onGameStart: () => void;

    constructor(playerManager: PlayerManagerServer, onGameStart: () => void, onPhaseChange: (phase: Phase) => void) {
        this.playerManager = playerManager;
        this.onPhaseChange = onPhaseChange;
        this.onGameStart = onGameStart;
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

    async setCurrentPhase(phase: Phase) {
        clearTimeout(this.timeOut);

        if (phase instanceof TimedPhase) {
            phase.setStartTime(Date.now());
            this.timeOut = setTimeout(
                () => {
                    let transitionDelay = 0;
                    if (phase instanceof StartingPhase) {
                        this.onGameStart();
                        transitionDelay = 150;
                    }
                    this.next(transitionDelay);
                },
                (phase as TimedPhase).duration * 1000 + 200
            );
        }

        if (phase.isSolo) {
            this.concernedPlayerId = (phase as SoloActionPhase).playerId;
        } else {
            this.concernedPlayerId = null;
        }

        if (!FREE_ROAM) this.playerManager.handlePlayersState(phase, this.concernedPlayerId);

        this.currentPhase = phase;
        this.onPhaseChange(phase);

        this.phaseStartEvent();
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
        if (!ActionPhase.TYPES.includes(this.currentPhase.type) || playerId !== this.concernedPlayerId) return;
        this.concernedPlayerId = null;

        clearTimeout(this.timeOut);
        await wait(250);
        this.next();
    }

    actionChoice(playerId: string, action: Action) {
        const player = this.playerManager.getPlayer(playerId);

        if (playerId !== this.concernedPlayerId || !player) return;

        if (action === Action.Move) {
            this.setCurrentPhase(new MovingPhase(Date.now(), {
                pseudo: player.playerRef.pseudo,
                playerId: playerId
            }));
        } else if (action === Action.Shoot) {
            this.setCurrentPhase(new ShootingPhase(Date.now(), {
                pseudo: player?.playerRef.pseudo,
                playerId: playerId
            }));
        } else if (action === Action.Reload) {
            player.reload();

            this.setCurrentPhase(new ReloadPhase(Date.now(), {
                pseudo: player.getPseudo(),
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
        if (FREE_ROAM) return;
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

    phaseStartEvent() {
        switch (this.currentPhase.type) {
            case PhaseTypes.Moving:
                this.movingPhaseStartEvent();
                break;
        }

        if (this.concernedPlayerId && isBotId(this.concernedPlayerId)) {
            (this.playerManager.getPlayer(this.concernedPlayerId) as Bot).runAlgo();
        }
    }

    movingPhaseStartEvent() {
        const concernedPlayer = this.playerManager.getPlayer(this.concernedPlayerId!);
        if (!concernedPlayer) return;

        concernedPlayer.fillMovementLeft();
        concernedPlayer.disableMass();

        const loop = setInterval(() => {
            if (this.currentPhase.type !== PhaseTypes.Moving) {
                clearInterval(loop);
                concernedPlayer.enableMass();
            } else if (!concernedPlayer.hasMovementLeft()) {
                clearInterval(loop);
                this.disableAction(concernedPlayer);
                concernedPlayer.enableMass();
                immobilizePlayer(concernedPlayer);
                this.next(500);
            }
        }, 50)
    }

    getCurrentPhase() {
        return this.currentPhase;
    }

    getConcernedPlayerId() {
        return this.concernedPlayerId;
    }
}