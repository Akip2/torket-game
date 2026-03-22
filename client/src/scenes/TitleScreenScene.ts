import { SceneNames } from "@shared/enums/SceneNames.enum";
import titleScreenHtml from "../dom-ui/title-screen.html?raw";
import roomCreationHtml from "../dom-ui/room-creation.html?raw";
import roomList from "../dom-ui/room-list.html?raw";
import { clearDomUi, getAvailableRooms, getCloseButton, getPrimaryUiRoot } from "../client-utils";
import { generateDefaultRoomName } from "@shared/utils";
import { generateRoomList } from "../dom-ui/component-generator";
import type { RoomJoiningData } from "@shared/types";
export default class TitleScreenScene extends Phaser.Scene {
    private currentRoomSelected: RoomJoiningData | null = null;

    constructor() {
        super(SceneNames.TitleScreen);
    }

    private getPlayerName() {
        const nameInput = document.getElementById("player-name") as HTMLInputElement;
        const name = nameInput?.value?.trim() || "Player";

        return name;
    }

    private quickPlay() {
        this.scene.start(SceneNames.Game, {
            playerData: {
                name: this.getPlayerName()
            }
        });
    }

    private createGame(playerName: string) {
        const gameName = (document.getElementById("game-name") as HTMLInputElement).value;
        const password = (document.getElementById("password") as HTMLInputElement).value;

        this.scene.start(SceneNames.Game, {
            playerData: {
                name: playerName
            },
            roomData: {
                creating: true,

                roomCreation: {
                    gameName: gameName,
                    password: password
                }
            }
        });
    }

    private joinGame(playerName: string) {
        this.scene.start(SceneNames.Game, {
            playerData: {
                name: playerName
            },
            roomData: {
                creating: false,

                roomJoining: this.currentRoomSelected
            }
        });
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
        })


        await this.displayCurrentAvailableRooms();

        const joinButton = document.getElementById("join-btn")!;
        joinButton.addEventListener("click", () => {
            this.joinGame(playerName);
        })

        const refreshButton = document.getElementById("refresh-btn");
        refreshButton?.addEventListener("click", () => {
            this.displayCurrentAvailableRooms();
        })
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
            this.currentRoomSelected = {
                gameId: tr.id
            };
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
        })
    }

    private showTitleScreen() {
        const uiRoot = getPrimaryUiRoot();
        uiRoot.innerHTML = titleScreenHtml;

        const quickPlay = document.getElementById("quick-play")!;
        quickPlay.addEventListener("click", () => { this.quickPlay() });

        const createGame = document.getElementById("create-game")!;
        createGame.addEventListener("click", () => { this.showRoomCreationForm() });

        const joinGame = document.getElementById("join-game")!;
        joinGame.addEventListener("click", () => { this.showAvailableRooms() });
    }

    async create() {
        this.showTitleScreen();

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            clearDomUi();
        });
    }
}