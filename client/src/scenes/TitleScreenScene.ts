import { SceneNames } from "@shared/enums/SceneNames.enum";
import titleScreenHtml from "../dom-ui/title-screen.html?raw";
import roomCreationHtml from "../dom-ui/room-creation.html?raw";
import roomList from "../dom-ui/room-list.html?raw";
import passwordForm from "../dom-ui/password-form.html?raw";
import { clearDomUi, clearSecondaryUiRoot, getAvailableRooms, getCloseButton, getPrimaryUiRoot, getSecondaryUiRoot, showToast } from "../client-utils";
import { generateDefaultRoomName } from "@shared/utils";
import { generateRoomList } from "../dom-ui/component-generator";
import type { RoomJoiningData } from "@shared/types";
import { Client, Room, ServerError } from "colyseus.js";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "ws://localhost:2567";

export default class TitleScreenScene extends Phaser.Scene {
    private currentRoomSelected: RoomJoiningData | null = null;
    private client = new Client(SERVER_URL);

    constructor() {
        super(SceneNames.TitleScreen);
    }

    private getPlayerName() {
        const nameInput = document.getElementById("player-name") as HTMLInputElement;
        return nameInput?.value?.trim() || "Player";
    }

    private quickPlay() {
        this.scene.start(SceneNames.Game, {
            playerData: { name: this.getPlayerName() }
        });
    }

    private async createGame(playerName: string) {
        const gameName = (document.getElementById("game-name") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;

        try {
            const room = await this.client.create("my_room", {
                playerData: { name: playerName },
                gameName,
                password
            });

            const messageBuffer = this.bufferCriticalMessages(room);

            this.scene.start(SceneNames.Game, {
                playerData: { name: playerName },
                room,
                messageBuffer
            });
        } catch (e: any) {
            const serverError = e as ServerError;
            showToast(serverError.message || "Failed to create room.");
        }
    }

    private async joinGame(playerName: string) {
        try {
            const room = await this.client.joinById(
                this.currentRoomSelected!.gameId,
                {
                    playerData: { name: playerName },
                    password: this.currentRoomSelected?.password
                }
            );

            const messageBuffer = this.bufferCriticalMessages(room);

            this.scene.start(SceneNames.Game, {
                playerData: { name: playerName },
                room,
                messageBuffer
            });
        } catch (e: unknown) {
            const serverError = e as ServerError;
            showToast(serverError.message || "Failed to join room.");
        }
    }

    private bufferCriticalMessages(room: Room): { type: RequestTypes, data: any }[] {
        const messageBuffer: { type: RequestTypes, data: any }[] = [];

        room.onMessage(RequestTypes.FullSynchro, (data) => {
            messageBuffer.push({ type: RequestTypes.FullSynchro, data });
        });
        room.onMessage(RequestTypes.TerrainSynchro, (data) => {
            messageBuffer.push({ type: RequestTypes.TerrainSynchro, data });
        });
        room.onMessage(RequestTypes.PhaseSynchro, (data) => {
            messageBuffer.push({ type: RequestTypes.PhaseSynchro, data });
        });

        return messageBuffer;
    }

    private showPasswordForm(playerName: string) {
        const uiRoot = getSecondaryUiRoot();
        uiRoot.innerHTML = passwordForm;

        const form = document.getElementById("password-form")!;
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const password = (document.getElementById("password") as HTMLInputElement).value;
            this.currentRoomSelected!.password = password;
            this.joinGame(playerName);
        });

        const closeButton = getCloseButton(1);
        closeButton.addEventListener("click", () => clearSecondaryUiRoot());
    }

    private async showAvailableRooms() {
        const playerName = this.getPlayerName();
        clearDomUi();

        const uiRoot = getPrimaryUiRoot();
        uiRoot.innerHTML = roomList;

        const closeButton = getCloseButton();
        closeButton.addEventListener("click", () => {
            clearDomUi();
            this.showTitleScreen();
        });

        await this.displayCurrentAvailableRooms();

        const joinButton = document.getElementById("join-btn")!;
        joinButton.addEventListener("click", () => {
            if (this.currentRoomSelected) {
                if (this.currentRoomSelected.password) {
                    this.showPasswordForm(playerName);
                } else {
                    this.joinGame(playerName);
                }
            }
        });

        const refreshButton = document.getElementById("refresh-btn");
        refreshButton?.addEventListener("click", () => this.displayCurrentAvailableRooms());
    }

    private async displayCurrentAvailableRooms() {
        this.currentRoomSelected = null;
        const rooms = await getAvailableRooms();

        const tbody = document.getElementById("room-container");
        if (!tbody) return;

        tbody.innerHTML = generateRoomList(rooms);

        tbody.addEventListener("click", (e) => {
            if (!(e.target instanceof HTMLElement)) return;

            if (this.currentRoomSelected) {
                document.getElementById(this.currentRoomSelected.gameId)?.classList.remove("selected");
            }

            const tr = e.target.closest("tr");
            if (!tr) {
                this.currentRoomSelected = null;
                return;
            }

            tr.classList.add("selected");
            this.currentRoomSelected = { gameId: tr.id };

            if (tr.dataset.private == "true") {
                this.currentRoomSelected.password = "PLACEHOLDER";
            }
        });
    }

    private showRoomCreationForm() {
        const playerName = this.getPlayerName();
        clearDomUi();

        const uiRoot = getPrimaryUiRoot();
        uiRoot.innerHTML = roomCreationHtml;

        const gameName = document.getElementById("game-name")! as HTMLInputElement;
        gameName.value = generateDefaultRoomName(playerName);

        const form = document.querySelector("form")!;
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            this.createGame(playerName);
        });

        const closeButton = getCloseButton();
        closeButton.addEventListener("click", () => {
            clearDomUi();
            this.showTitleScreen();
        });
    }

    private showTitleScreen() {
        const uiRoot = getPrimaryUiRoot();
        uiRoot.innerHTML = titleScreenHtml;

        document.getElementById("quick-play")!.addEventListener("click", () => this.quickPlay());
        document.getElementById("create-game")!.addEventListener("click", () => this.showRoomCreationForm());
        document.getElementById("join-game")!.addEventListener("click", () => this.showAvailableRooms());
    }

    async create() {
        this.showTitleScreen();
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => clearDomUi());
    }
}