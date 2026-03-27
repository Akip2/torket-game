import { SceneNames } from "@shared/enums/SceneNames.enum";
import titleScreenHtml from "../dom-ui/title-screen.html?raw";
import roomCreationHtml from "../dom-ui/room-creation.html?raw";
import roomListHtml from "../dom-ui/room-list.html?raw";
import passwordFormHtml from "../dom-ui/password-form.html?raw";
import mapSelectionHtml from "../dom-ui/map-selection.html?raw";
import { clearDomUi, clearSecondaryUiRoot, getCloseButton, getPrimaryUiRoot, getSecondaryUiRoot, getServerUrl, mountWithTransition, showToast } from "../client-utils";
import { generateDefaultRoomName } from "@shared/utils";
import { generateMapCard, generateRoomComponent, setupMapCard } from "../dom-ui/component-generator";
import type { AvailableRoomData, MapPreviewData, RoomJoiningData } from "@shared/types";
import { Client, Room, ServerError } from "colyseus.js";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import { getCookie } from 'typescript-cookie'

export default class TitleScreenScene extends Phaser.Scene {
    private currentRoomSelected: RoomJoiningData | null = null;
    private client = new Client(getServerUrl());
    private playerName?: string;

    constructor() {
        super(SceneNames.TitleScreen);
        this.playerName = getCookie("playerName");
    }

    private getPlayerName() {
        const nameInput = document.getElementById("player-name") as HTMLInputElement;
        return nameInput?.value?.trim() || "Player";
    }

    private async quickPlay() {
        this.playerName = this.getPlayerName();

        try {
            const room = await this.client.joinOrCreate("my_room", {
                playerData: { name: this.playerName }
            });

            const messageBuffer = this.bufferCriticalMessages(room);

            this.scene.start(SceneNames.Game, {
                playerData: { name: this.playerName },
                room,
                messageBuffer
            });
        } catch (e: any) {
            const serverError = e as ServerError;
            showToast(serverError.message || "Failed to join a room.");
        }
    }

    private async createGame() {
        const gameName = (document.getElementById("game-name") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;
        const mapId = (document.getElementsByClassName("map-id")[0] as HTMLInputElement).value;

        try {
            const room = await this.client.create("my_room", {
                playerData: { name: this.playerName },
                gameName,
                password,
                mapId
            });

            const messageBuffer = this.bufferCriticalMessages(room);

            this.scene.start(SceneNames.Game, {
                playerData: { name: this.playerName },
                room,
                messageBuffer
            });
        } catch (e: any) {
            const serverError = e as ServerError;
            showToast(serverError.message || "Failed to create room.");
        }
    }

    private async joinGame() {
        try {
            const room = await this.client.joinById(
                this.currentRoomSelected!.gameId,
                {
                    playerData: { name: this.playerName },
                    password: this.currentRoomSelected?.password
                }
            );

            const messageBuffer = this.bufferCriticalMessages(room);

            this.scene.start(SceneNames.Game, {
                playerData: { name: this.playerName },
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

    private showPasswordForm() {
        const uiRoot = getSecondaryUiRoot();
        mountWithTransition(uiRoot, passwordFormHtml);

        const form = document.getElementById("password-form")!;
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            const password = (document.getElementById("password") as HTMLInputElement).value;
            this.currentRoomSelected!.password = password;
            this.joinGame();
        });

        const closeButton = getCloseButton(1);
        closeButton.addEventListener("click", () => clearSecondaryUiRoot());
    }

    private async showAvailableRooms() {
        this.playerName = this.getPlayerName();
        clearDomUi();

        const uiRoot = getPrimaryUiRoot();
        mountWithTransition(uiRoot, roomListHtml);

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
                    this.showPasswordForm();
                } else {
                    this.joinGame();
                }
            }
        });

        const refreshButton = document.getElementById("refresh-btn");
        refreshButton?.addEventListener("click", () => this.displayCurrentAvailableRooms());
    }

    private async displayCurrentAvailableRooms() {
        this.currentRoomSelected = null;
        const rooms = ((await this.client.http.get("/rooms")).data) as AvailableRoomData[];

        const tbody = document.getElementById("room-container");
        if (!tbody) return;

        tbody.innerHTML = "";
        rooms.forEach((room) => {
            tbody.innerHTML += generateRoomComponent(room);
        });

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

    private async showRoomCreationForm() {
        this.playerName = this.getPlayerName();
        clearDomUi();

        const uiRoot = getPrimaryUiRoot();
        mountWithTransition(uiRoot, roomCreationHtml);

        const gameName = document.getElementById("game-name")! as HTMLInputElement;
        gameName.value = generateDefaultRoomName(this.playerName);

        const form = document.querySelector("form")!;
        form.addEventListener("submit", (event) => {
            event.preventDefault();
            this.createGame();
        });

        const defaultMap = (await this.client.http.get("maps/default")).data;
        const mapCard = document.getElementsByClassName("map-card")[0]!;

        setupMapCard(mapCard, defaultMap);

        const mapPreviewWrapper = document.getElementById("map-preview-wrapper")!;
        mapPreviewWrapper.addEventListener("click", () => { this.showMapSelection() });

        const closeButton = getCloseButton();
        closeButton.addEventListener("click", () => {
            clearDomUi();
            this.showTitleScreen();
        });
    }

    private async showMapSelection() {
        const uiRoot = getSecondaryUiRoot();
        mountWithTransition(uiRoot, mapSelectionHtml);

        const currentMapCard = document.getElementsByClassName("map-card")[0]!;

        const mapContainer = document.getElementById("map-container");

        const maps: MapPreviewData[] = (await this.client.http.get("/maps")).data;
        maps.forEach(map => {
            mapContainer?.appendChild(generateMapCard(map));
        });

        mapContainer?.addEventListener("click", (e) => { this.selectMap(e, currentMapCard) });

        const closeButton = getCloseButton(1);
        closeButton.addEventListener("click", () => {
            clearSecondaryUiRoot();
        });
    }

    private selectMap(e: PointerEvent, currentMapCard: Element) {
        if (!(e.target instanceof HTMLElement)) return;

        const mapCard = e.target.closest(".map-card");
        if (!mapCard) return;

        const canvas = mapCard.querySelector(".map-preview")!;
        const wrapper = document.createElement("div");
        wrapper.id = "map-preview-wrapper";
        canvas.replaceWith(wrapper);
        wrapper.appendChild(canvas);
        wrapper.addEventListener("click", () => { this.showMapSelection() });

        currentMapCard.replaceWith(mapCard);

        clearSecondaryUiRoot();
    }

    private showTitleScreen() {
        const uiRoot = getPrimaryUiRoot();
        uiRoot.innerHTML = titleScreenHtml;

        const playerNameInput = document.getElementById("player-name") as HTMLInputElement;
        playerNameInput.value = this.playerName ?? "";

        document.getElementById("quick-play")!.addEventListener("click", () => this.quickPlay());
        document.getElementById("create-game")!.addEventListener("click", () => this.showRoomCreationForm());
        document.getElementById("join-game")!.addEventListener("click", () => this.showAvailableRooms());
    }

    async create() {
        this.showTitleScreen();
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => clearDomUi());
    }
}