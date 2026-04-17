import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import { Client, type Room } from "colyseus.js";
import { getServerUrl } from "../client-utils";
import type { RoomJoiningData } from "@shared/types";

export default class RoomManager {
    private static room: Room;
    private static client = new Client(getServerUrl());

    static setRoom(room: Room) {
        this.room = room;
    }

    static getRoom() {
        return this.room;
    }

    static async quickPlay(playerName: string | undefined) {
        this.room = await this.client.joinOrCreate("my_room", {
            playerData: { name: playerName }
        });

        return this.bufferCriticalMessages();
    }

    static async createGame(playerName: string | undefined, gameName: string, password: string, mapId: string) {
        this.room = await this.client.create("my_room", {
            playerData: { name: playerName },
            gameName,
            password,
            mapId
        });

        return this.bufferCriticalMessages();
    }

    static async joinGame(playerName: string | undefined, currentRoomSelected: RoomJoiningData) {
        this.room = await this.client.joinById(
            currentRoomSelected.gameId,
            {
                playerData: { name: playerName },
                password: currentRoomSelected.password
            }
        );

        return this.bufferCriticalMessages();
    }

    private static bufferCriticalMessages(): { type: RequestTypes, data: any }[] {
        const messageBuffer: { type: RequestTypes, data: any }[] = [];

        this.room.onMessage(RequestTypes.FullSynchro, (data) => {
            messageBuffer.push({ type: RequestTypes.FullSynchro, data });
        });
        this.room.onMessage(RequestTypes.TerrainSynchro, (data) => {
            messageBuffer.push({ type: RequestTypes.TerrainSynchro, data });
        });
        this.room.onMessage(RequestTypes.PhaseSynchro, (data) => {
            messageBuffer.push({ type: RequestTypes.PhaseSynchro, data });
        });

        return messageBuffer;
    }
}