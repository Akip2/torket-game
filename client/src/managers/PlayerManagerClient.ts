import { getStateCallbacks, type Room } from "colyseus.js";
import PlayerClient from "../game-objects/PlayerClient";
import type GameScene from "../scenes/GameScene";
import type { InputPayload, Position } from "@shared/types";
import { movePlayerFromInputs, playerReactToExplosion } from "@shared/logics/player-logic";
import { CLIENT_PREDICTION, DEBUG } from "@shared/const";
import { Depths } from "@shared/enums/Depths.eunum";
import type ShotManager from "./ShotManager";

export default class PlayerManagerClient {
    room: Room;

    localInputBuffer: InputPayload[] = [];

    currentPlayer!: PlayerClient;
    remoteRef!: Phaser.GameObjects.Rectangle;
    playerObjects: { [sessionId: string]: PlayerClient } = {};

    constructor(room: Room) {
        this.room = room;
    }

    setupPlayerListeners(scene: GameScene) {
        const $ = getStateCallbacks(this.room);

        $(this.room.state).players.onAdd((player, sessionId) => this.addPlayer(scene, player, sessionId));
        $(this.room.state).players.onRemove((_player, sessionId) => this.removePlayer(sessionId));
    }

    addPlayer(scene: GameScene, player: any, sessionId: string) {
        const playerObject = new PlayerClient(scene, player.pseudo, player.x, player.y);
        playerObject.hp = player.hp;
        playerObject.isAlive = player.isAlive;
        this.playerObjects[sessionId] = playerObject;

        if (sessionId === this.room.sessionId) {
            this.remoteRef = scene.add.rectangle(0, 0, playerObject.width, playerObject.height);
            this.remoteRef.setStrokeStyle(1, 0xff0000)
                .setDepth(Depths.Debug)
                .setVisible(DEBUG);

            this.setupLocalPlayer(player, playerObject, scene.shotManager);
        } else {
            this.setupRemotePlayer(player, playerObject);
        }
    }

    setupLocalPlayer(player: any, playerObject: PlayerClient, shotManager: ShotManager) {
        const $ = getStateCallbacks(this.room);

        this.currentPlayer = playerObject;

        $(player).onChange(() => {
            const serverX = player.x;
            const serverY = player.y

            if (CLIENT_PREDICTION) {
                //TODO maybe
            } else {
                this.currentPlayer.x = Phaser.Math.Linear(this.currentPlayer.x, serverX, 0.5);
                this.currentPlayer.y = Phaser.Math.Linear(this.currentPlayer.y, serverY, 0.75);
            }

            this.remoteRef.x = serverX;
            this.remoteRef.y = serverY;

            if (playerObject.state != player.state) {
                playerObject.state = player.state;
                shotManager.cancelShot();
            }
        });
    }

    setupRemotePlayer(player: any, playerObject: PlayerClient) {
        const $ = getStateCallbacks(this.room);

        $(player).onChange(() => {
            playerObject.setData("serverX", player.x);
            playerObject.setData("serverY", player.y);
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
    }

    updatePlayers() {
        for (const sessionId in this.playerObjects) {
            const playerObject = this.playerObjects[sessionId];
            if (sessionId !== this.room.sessionId) {
                const { serverX, serverY, mousePosition } = playerObject.data.values;
                playerObject.x = Phaser.Math.Linear(playerObject.x, serverX, 0.175);
                playerObject.y = Phaser.Math.Linear(playerObject.y, serverY, 0.35);

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

    handleLocalInput(inputPayload: InputPayload, mousePosition: Position) {
        if (CLIENT_PREDICTION) {
            movePlayerFromInputs(this.currentPlayer, inputPayload);
        }
        this.currentPlayer.updateGunPlacement(mousePosition);
    }

    getPlayer(id: string) {
        return this.playerObjects[id];
    }
}