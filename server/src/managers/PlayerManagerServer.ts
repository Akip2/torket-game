import { immobilizePlayer, isPlayerInRadius, movePlayerFromInputs, playerReactToExplosion } from "@shared/logics/player-logic";
import { InputPayload, PendingExplosion } from "@shared/types";
import PlayerServer from "../bodies/PlayerServer";
import { Player } from "../rooms/schema/MyRoomState";
import PhysicsManager from "./PhysicsManager";
import Phase from "@shared/data/phases/Phase";
import SoloActionPhase from "@shared/data/phases/SoloActionPhase";
import { PlayerState } from "@shared/enums/PlayerState.enum";
import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import { EXPLOSION_CONST } from "@shared/const";
import { Body } from "matter-js";

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

            let input: InputPayload | undefined;
            while (input = queue.shift()) {
                movePlayerFromInputs(playerBody, input);
            }
        });
    }

    applyExplosion(pendingExplosion: PendingExplosion) {
        this.playerBodies.forEach((p, id) => {
            playerReactToExplosion(p, pendingExplosion);

            if (isPlayerInRadius(p, pendingExplosion.cx, pendingExplosion.cy, pendingExplosion.radius)) {
                this.playerBodies.get(id)?.applyDamage(pendingExplosion.damage!, true);
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