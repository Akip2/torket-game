import { SceneNames } from "@shared/enums/SceneNames.enum";

export default class TitleScreenScene extends Phaser.Scene {
    private nameInput?: HTMLInputElement;
    private centralContainer?: HTMLElement;

    constructor() {
        super(SceneNames.TitleScreen);
    }

    private quickPlay() {
        const name = this.nameInput?.value?.trim() || "Player";
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

    create() {
        this.centralContainer = document.createElement("div");
        this.centralContainer.className = "central-container-title-screen";

        this.createTitle(this.centralContainer);

        const inputContainer = document.createElement("div");
        inputContainer.className = "input-container-title-screen";

        this.createNameInput(inputContainer)
        this.createButtons(inputContainer);

        this.centralContainer.appendChild(inputContainer);
        const gameContainer = document.getElementById("game-container")!;
        gameContainer.appendChild(this.centralContainer);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.cleanupUI();
        });
    }

    private createNameInput(container: HTMLElement) {
        this.nameInput = document.createElement("input");
        this.nameInput.type = "text";
        this.nameInput.setAttribute("placeholder", "Enter your name here");

        container.appendChild(this.nameInput);
    }

    private createTitle(container: HTMLElement) {
        const title = document.createElement("h1");
        title.textContent = "TORKET.IO";

        container.appendChild(title);
    }

    private createButtons(container: HTMLElement) {
        const buttonData = [
            { text: "Quick Play", action: () => this.quickPlay() },
            { text: "Join Game", action: () => this.joinGame() },
            { text: "Create Game", action: () => this.createGame() },
        ];

        buttonData.forEach((data) => {
            const btn = document.createElement("button");
            btn.textContent = data.text;
            btn.onclick = data.action;

            container.appendChild(btn);
        });
    }

    private cleanupUI() {
        this.centralContainer?.remove();
    }
}