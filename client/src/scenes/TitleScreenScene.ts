import { SceneNames } from "@shared/enums/SceneNames.enum";
import titleScreenHtml from "../dom-ui/title-screen.html?raw";

export default class TitleScreenScene extends Phaser.Scene {
    constructor() {
        super(SceneNames.TitleScreen);
    }

    private quickPlay() {
        const nameInput = document.getElementById("player-name") as HTMLInputElement;
        const name = nameInput?.value?.trim() || "Player";
        this.scene.start(SceneNames.Game, {
            name: name
        });
    }

    private joinGame() {
        //TODO
    }

    private createGame() {
        //TODO
    }

    async create() {
        const uiRoot = document.getElementById("ui-container")!;
        uiRoot.innerHTML = titleScreenHtml;

        const quickPlay = document.getElementById("quick-play")!;

        quickPlay.addEventListener("click", () => { this.quickPlay() });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            uiRoot.innerHTML = "";
        });
    }
}