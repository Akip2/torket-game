import { getStateCallbacks, type Room } from "colyseus.js";
import PlayerClient from "../game-objects/PlayerClient";
import type GameScene from "../scenes/GameScene";
import type { InputPayload, Position } from "@shared/types";
import { playerReactToExplosion } from "@shared/logics/player-logic";
import { DEBUG, INTERPOLATION_SPEED, INTERPOLATION_SPEED_Y } from "@shared/const";
import { Depths } from "@shared/enums/Depths.eunum";
import type ShotManager from "./ShotManager";
import { PlayerState } from "@shared/enums/PlayerState.enum";
import { setCursor } from "../client-utils";
import { Cursor } from "@shared/enums/Cursor.enum";
import SoundManager from "./SoundManager";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";

interface RemotePlayerState {
    lastX: number;
    lastY: number;
    targetX: number;
    targetY: number;
    lastUpdateTime: number;
    velocityX: number;
    velocityY: number;
}

export default class PlayerManagerClient {
    room: Room;

    localInputBuffer: InputPayload[] = [];

    currentPlayer!: PlayerClient;
    remoteRef!: Phaser.GameObjects.Rectangle;
    playerObjects: { [sessionId: string]: PlayerClient } = {};
    remotePlayerStates: { [sessionId: string]: RemotePlayerState } = {};

    constructor(room: Room) {
        this.room = room;
    }

    setupPlayerListeners(scene: GameScene) {
        const $ = getStateCallbacks(this.room);

        $(this.room.state).players.onAdd((player, sessionId) => this.addPlayer(scene, player, sessionId));
        $(this.room.state).players.onRemove((_player, sessionId) => this.removePlayer(sessionId));
    }

    addPlayer(scene: GameScene, player: any, sessionId: string) {
        const isSelf = sessionId === this.room.sessionId;

        const playerObject = new PlayerClient(scene, player.pseudo, player.x, player.y, isSelf);
        playerObject.hp = player.hp;
        playerObject.isAlive = player.isAlive;
        this.playerObjects[sessionId] = playerObject;

        // Always track player state for smooth interpolation
        this.remotePlayerStates[sessionId] = {
            lastX: player.x,
            lastY: player.y,
            targetX: player.x,
            targetY: player.y,
            lastUpdateTime: Date.now(),
            velocityX: 0,
            velocityY: 0
        };

        if (isSelf) {
            this.remoteRef = scene.add.rectangle(0, 0, playerObject.width, playerObject.height);
            this.remoteRef.setStrokeStyle(1, 0xff0000)
                .setDepth(Depths.Debug)
                .setVisible(DEBUG);

            this.setupLocalPlayer(player, playerObject, scene.shotManager);
        } else {
            this.setupRemotePlayer(player, playerObject, sessionId);
        }
    }

    setupLocalPlayer(player: any, playerObject: PlayerClient, shotManager: ShotManager) {
        const $ = getStateCallbacks(this.room);

        this.currentPlayer = playerObject;

        $(player).onChange(() => {
            const serverX = player.x;
            const serverY = player.y;
            const state = this.remotePlayerStates[this.room.sessionId];

            // Update target position for interpolation
            if (state) {
                state.lastX = state.targetX;
                state.lastY = state.targetY;
                state.targetX = serverX;
                state.targetY = serverY;
                state.lastUpdateTime = Date.now();
            }

            this.remoteRef.x = serverX;
            this.remoteRef.y = serverY;

            if (playerObject.state != player.state) {
                playerObject.state = player.state;

                switch (playerObject.state) {
                    case PlayerState.Shooting:
                        SoundManager.play(RessourceKeys.Reloading);
                        setCursor(Cursor.Crosshair);
                        break;

                    default:
                        setCursor(Cursor.Default);
                }

                shotManager.cancelShot();
            }
        });
    }

    setupRemotePlayer(player: any, playerObject: PlayerClient, sessionId: string) {
        const $ = getStateCallbacks(this.room);

        $(player).onChange(() => {
            const state = this.remotePlayerStates[sessionId];
            if (!state) return;

            const newX = player.x;
            const newY = player.y;
            const now = Date.now();
            const timeDiff = Math.max(now - state.lastUpdateTime, 16); // Min 16ms (60 FPS)

            // Calculate velocity for smooth prediction
            state.velocityX = (newX - state.targetX) / (timeDiff / 1000);
            state.velocityY = (newY - state.targetY) / (timeDiff / 1000);

            state.lastX = state.targetX;
            state.lastY = state.targetY;
            state.targetX = newX;
            state.targetY = newY;
            state.lastUpdateTime = now;

            playerObject.setData("serverX", newX);
            playerObject.setData("serverY", newY);
            playerObject.setData("mousePosition", {
                x: player.mouseX,
                y: player.mouseY
            });

            playerObject.state = player.state;
        });
    }

    removePlayer(sessionId: string) {
        this.playerObjects[sessionId]?.destroy();
        delete this.playerObjects[sessionId];
        delete this.remotePlayerStates[sessionId];
    }

    updatePlayers(_deltaTime: number = 16) {
        const now = Date.now();
        const localSessionId = this.room.sessionId;

        for (const sessionId in this.playerObjects) {
            const playerObject = this.playerObjects[sessionId];
            const state = this.remotePlayerStates[sessionId];
            if (!state) continue;

            if (sessionId === localSessionId) {
                // Local player: snap to server position (no jitter, no trembling)
                playerObject.x = state.targetX;
                playerObject.y = state.targetY;
            } else {
                // Remote players: smooth interpolation
                const timeSinceUpdate = now - state.lastUpdateTime;
                const expectedUpdateInterval = 1000 / 60; // 60 Hz expected
                
                let alphaX = INTERPOLATION_SPEED;
                let alphaY = INTERPOLATION_SPEED_Y;
                
                // If it's been a while, catch up faster
                if (timeSinceUpdate > expectedUpdateInterval * 2) {
                    alphaX = 0.5;
                    alphaY = 0.6;
                } else if (timeSinceUpdate < expectedUpdateInterval / 2) {
                    alphaX = 0.25;
                    alphaY = 0.35;
                }

                playerObject.x = Phaser.Math.Linear(playerObject.x, state.targetX, alphaX);
                playerObject.y = Phaser.Math.Linear(playerObject.y, state.targetY, alphaY);
            }

            if (playerObject.data && playerObject.data.values) {
                const { mousePosition } = playerObject.data.values;
                playerObject.updateGunPlacement(mousePosition);
            }
            playerObject.updateUI();
        }
    }

    reactToExplosion(cx: number, cy: number, radius: number) {
        for (const sessionId in this.playerObjects) {
            const playerObject = this.playerObjects[sessionId];

            playerReactToExplosion(playerObject, cx, cy, radius);
        }
    }

    handleLocalInput(_inputPayload: InputPayload, mousePosition: Position) {
        // Don't apply physics locally - let server be the authority
        // Just send input to server, it will handle physics and send back position
        this.currentPlayer.updateGunPlacement(mousePosition);
    }

    getPlayer(id: string) {
        return this.playerObjects[id];
    }

    getPlayersAlive() {
        const res = [];
        for (const sessionId in this.playerObjects) {
            const player = this.playerObjects[sessionId];
            if (player.isAlive) {
                res.push(player);
            }
        }

        return res;
    }
}