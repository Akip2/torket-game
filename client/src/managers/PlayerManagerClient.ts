import { getStateCallbacks, type Room } from "colyseus.js";
import PlayerClient from "../game-objects/PlayerClient";
import type GameScene from "../scenes/GameScene";
import type { InputPayload, Position } from "@shared/types";
import { playerReactToExplosion } from "@shared/logics/player-logic";
import { DEBUG, INTERPOLATION_SPEED_X, INTERPOLATION_SPEED_Y } from "@shared/const";
import { Depths } from "@shared/enums/Depths.eunum";
import type ShotManager from "./ShotManager";
import { PlayerState } from "@shared/enums/PlayerState.enum";
import { setCursor } from "../client-utils";
import { Cursor } from "@shared/enums/Cursor.enum";
import SoundManager from "./SoundManager";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";

export default class PlayerManagerClient {
    room: Room;

    localInputBuffer: InputPayload[] = [];

    currentPlayer!: PlayerClient;
    remoteRef!: Phaser.GameObjects.Rectangle;

    playerObjects: Record<string, PlayerClient> = {};

    constructor(room: Room) {
        this.room = room;
    }

    setupPlayerListeners(scene: GameScene) {
        const $ = getStateCallbacks(this.room);

        $(this.room.state).players.onAdd((player, sessionId) =>
            this.addPlayer(scene, player, sessionId)
        );

        $(this.room.state).players.onRemove((_player, sessionId) =>
            this.removePlayer(sessionId)
        );
    }

    addPlayer(scene: GameScene, player: any, sessionId: string) {
        const isSelf = sessionId === this.room.sessionId;

        const playerObject = new PlayerClient(
            scene,
            player.pseudo,
            player.x,
            player.y,
            isSelf
        );

        playerObject.hp = player.hp;
        playerObject.isAlive = player.isAlive;

        this.playerObjects[sessionId] = playerObject;

        playerObject.setData("targetX", player.x);
        playerObject.setData("targetY", player.y);

        if (isSelf) {
            this.remoteRef = scene.add.rectangle(
                0,
                0,
                playerObject.width,
                playerObject.height
            );

            this.remoteRef
                .setStrokeStyle(1, 0xff0000)
                .setDepth(Depths.Debug)
                .setVisible(DEBUG);

            scene.worldContainer.add(this.remoteRef);

            this.setupLocalPlayer(player, playerObject, scene.shotManager);
        } else {
            this.setupRemotePlayer(player, playerObject);
        }
    }

    setupLocalPlayer(player: any, playerObject: PlayerClient, shotManager: ShotManager) {
        const $ = getStateCallbacks(this.room);

        this.currentPlayer = playerObject;

        $(player).onChange(() => {
            playerObject.setData("targetX", player.x);
            playerObject.setData("targetY", player.y);

            this.remoteRef.x = player.x;
            this.remoteRef.y = player.y;

            if (playerObject.state !== player.state) {
                playerObject.state = player.state;

                switch (playerObject.state) {
                    case PlayerState.Shooting:
                        SoundManager.play(RessourceKeys.Reloading);
                        setCursor(Cursor.Crosshair);
                        break;

                    case PlayerState.Moving:
                        playerObject.fillMovementLeft();
                        break;

                    default:
                        setCursor(Cursor.Default);
                }

                shotManager.cancelShot();
            }
        });
    }

    setupRemotePlayer(player: any, playerObject: PlayerClient) {
        const $ = getStateCallbacks(this.room);

        $(player).onChange(() => {
            playerObject.setData("targetX", player.x);
            playerObject.setData("targetY", player.y);

            playerObject.setData("mousePosition", {
                x: player.mouseX,
                y: player.mouseY
            });

            playerObject.state = player.state;
            playerObject.movementLeft = player.movementLeft;
        });
    }

    removePlayer(sessionId: string) {
        this.playerObjects[sessionId]?.destroy();
        delete this.playerObjects[sessionId];
    }

    updatePlayers() {
        const localSessionId = this.room.sessionId;

        for (const sessionId in this.playerObjects) {
            const playerObject = this.playerObjects[sessionId];

            const targetX = playerObject.getData("targetX");
            const targetY = playerObject.getData("targetY");

            if (sessionId === localSessionId) {
                playerObject.x = targetX;
                playerObject.y = targetY;
            } else {
                playerObject.x = Phaser.Math.Linear(
                    playerObject.x,
                    targetX,
                    INTERPOLATION_SPEED_X
                );

                playerObject.y = Phaser.Math.Linear(
                    playerObject.y,
                    targetY,
                    INTERPOLATION_SPEED_Y
                );
            }

            const mouse = playerObject.getData("mousePosition");

            if (mouse) {
                playerObject.updateGunPlacement(mouse);
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
        this.currentPlayer.updateGunPlacement(mousePosition);
    }

    getPlayer(id: string) {
        return this.playerObjects[id];
    }

    getPlayersAlive() {
        const res: PlayerClient[] = [];

        for (const sessionId in this.playerObjects) {
            const player = this.playerObjects[sessionId];

            if (player.isAlive) {
                res.push(player);
            }
        }

        return res;
    }
}