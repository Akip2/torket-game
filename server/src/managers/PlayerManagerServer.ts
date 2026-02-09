import { isPlayerInRadius, movePlayerFromInputs, playerReactToExplosion } from "@shared/logics/player-logic";
import { InputPayload } from "@shared/types";
import PlayerServer from "src/bodies/PlayerServer";
import { Player } from "src/rooms/schema/MyRoomState";
import PhysicsManager from "./PhysicsManager";
import Phase from "@shared/data/phases/Phase";
import SoloActionPhase from "@shared/data/phases/SoloActionPhase";
import { PlayerState } from "@shared/enums/PlayerState.enum";
import ShootingPhase from "@shared/data/phases/ShootingPhase";
import ActionChoicePhase from "@shared/data/phases/ActionChoicePhase";
import MovingPhase from "@shared/data/phases/MovingPhase";
import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";

export default class PlayerManagerServer {
    playerBodies: Map<string, PlayerServer>;

    constructor() {
        this.playerBodies = new Map();
    }

    addPlayer(sessionId: string, player: Player, onDamage: (hp: number) => void, physicsManager: PhysicsManager) {
        const playerBody = new PlayerServer(player, sessionId, (hp: number) => onDamage(hp));
        this.playerBodies.set(sessionId, playerBody);
        physicsManager.add(playerBody);
    }

    updateRefsPosition() {
        this.playerBodies.forEach((playerBody) => {
            playerBody.updatePlayerRefPosition();
        });
    }

    handlePlayersState(phase: Phase) {
        if (phase instanceof SoloActionPhase) {
            const actionPhase = phase as SoloActionPhase;
            const concernedPlayerId = actionPhase.playerId;

            let concernedPlayerState;
            switch (phase.type) {
                case PhaseTypes.Shooting:
                    concernedPlayerState = PlayerState.Shooting
                    break;
                
                case PhaseTypes.Moving:
                    concernedPlayerState = PlayerState.Moving
                    break;
                
                default:
                    concernedPlayerState = PlayerState.Inactive;
            }

            this.playerBodies.forEach((playerBody, id) => {
                if (id === concernedPlayerId) {
                    playerBody.setState(concernedPlayerState);
                } else {
                    playerBody.setState(PlayerState.Inactive);
                }
            });
        } else {
            this.playerBodies.forEach((playerBody, id) => {
                playerBody.setState(PlayerState.Inactive);
            });
        }
    }

    applyInputs() {
        this.playerBodies.forEach((playerBody, id) => {
            const queue = playerBody.getInputQueue();
            if (queue.length > 0) {
                const last = queue[queue.length - 1];
                playerBody.lastProcessedTimeStamp = last.timeStamp;
                playerBody.updatePlayerRefMouse(last.mousePosition);
            }

            let input: InputPayload;
            while (input = queue.shift()) {
                movePlayerFromInputs(playerBody, input);
            }
        });
    }

    applyExplosion(cx: number, cy: number, radius: number) {
        this.playerBodies.forEach((p, id) => {
            playerReactToExplosion(p, cx, cy, radius);

            if (isPlayerInRadius(p, cx, cy, radius)) {
                this.playerBodies.get(id)?.applyDamage(false);
            }
        });
    }

    getPlayer(sessionId: string) {
        return this.playerBodies.get(sessionId);
    }

    getPlayerNb() {
        return this.playerBodies.size;
    }

    getPlayersAlive() {
        const res: PlayerServer[] = [];
        this.playerBodies.forEach((playerBody, key) => {
            if (playerBody.isAlive()) {
                res.push(playerBody);
            }
        })

        return res;
    }

    removePlayer(sessionId: string) {
        const playerBody = this.getPlayer(sessionId);
        if (playerBody) {
            playerBody.removeFromWorld();
            this.playerBodies.delete(sessionId);
        }
    }
}