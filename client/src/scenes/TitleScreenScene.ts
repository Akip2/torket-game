import { SceneNames } from "@shared/enums/SceneNames.enum";
import titleScreenHtml from "../dom-ui/title-screen.html?raw";
import roomCreationHtml from "../dom-ui/room-creation.html?raw";
import { clearDomUi, getUiRoot } from "../client-utils";
export default class TitleScreenScene extends Phaser.Scene {
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

    private showAvailableRooms() {
        //TODO
    }

    private showRoomCreationForm() {
        const playerName = this.getPlayerName();
        clearDomUi();

        const uiRoot = getUiRoot();
        uiRoot.innerHTML = roomCreationHtml;

        const gameName = document.getElementById("game-name")! as HTMLInputElement;
        gameName.value = `${playerName}'s game`;

        const form = document.querySelector("form")!;
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            this.createGame(playerName);
        });
    }

    private showTitleScreen() {
        const uiRoot = getUiRoot();
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