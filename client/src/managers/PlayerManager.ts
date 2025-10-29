import { getStateCallbacks, type Room } from "colyseus.js";
import PlayerClient from "../game-objects/PlayerClient";
import type GameScene from "../scenes/GameScene";
import type { InputPayload, Position } from "@shared/types";
import { movePlayerFromInputs, playerReactToExplosion } from "@shared/logics/player-logic";
import { DEBUG } from "@shared/const";

export default class PlayerManager {
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
        const playerObject = new PlayerClient(scene, player.x, player.y);
        playerObject.hp = player.hp;
        playerObject.isAlive = player.isAlive;
        this.playerObjects[sessionId] = playerObject;

        if (sessionId === this.room.sessionId) {
            this.remoteRef = scene.add.rectangle(0, 0, playerObject.width, playerObject.height);
            this.remoteRef.setStrokeStyle(1, 0xff0000);
            this.remoteRef.setVisible(DEBUG);

            this.setupLocalPlayer(player, playerObject);
        } else {
            this.setupRemotePlayer(player, playerObject);
        }
    }

    setupLocalPlayer(player: any, playerObject: PlayerClient) {
        const $ = getStateCallbacks(this.room);

        this.currentPlayer = playerObject;

        $(player).onChange(() => {
            const serverX = player.x;
            const serverY = player.y;
            const predictedX = this.currentPlayer.x;
            const predictedY = this.currentPlayer.y;
            const THRESHOLD = 2;

            if (Math.abs(serverX - predictedX) > THRESHOLD || Math.abs(serverY - predictedY) > THRESHOLD) {
                this.currentPlayer.x = serverX;
                this.currentPlayer.y = serverY;
                this.localInputBuffer = this.localInputBuffer.filter(input => input.timeStamp > player.timeStamp);

                for (const input of this.localInputBuffer) {
                    movePlayerFromInputs(this.currentPlayer, input, true);
                }
            }
            this.remoteRef.x = serverX;
            this.remoteRef.y = serverY;
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

            playerObject.updateHealthBar();
        }
    }

    reactToExplosion(cx: number, cy: number, radius: number) {
        for (const sessionId in this.playerObjects) {
            const playerObject = this.playerObjects[sessionId];

            playerReactToExplosion(playerObject, cx, cy, radius);
        }
    }

    handleLocalInput(inputPayload: InputPayload, mousePosition:  Position) {
        movePlayerFromInputs(this.currentPlayer, inputPayload);
        this.currentPlayer.updateGunPlacement(mousePosition);
    }

    getPlayer(id: string) {
        return this.playerObjects[id];
    }
}