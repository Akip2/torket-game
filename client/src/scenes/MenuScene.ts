import { getTextWidth } from "@shared/utils";
import Button from "../ui/Button"
import { ButtonStyle } from "../ui/ui-styles";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene')
    }

    quickPlay() {
        this.scene.start("TestScene");
    }

    joinGame() {
        //TODO
    }

    createGame() {
        //TODO
    }

    create() {
        const centerX = this.cameras.main.width / 2
        const centerY = this.cameras.main.height / 2

        const buttonStyle = ButtonStyle.MainMenu as Phaser.Types.GameObjects.Text.TextStyle;
        buttonStyle.fixedWidth = getTextWidth("Create Game", buttonStyle.fontSize as string);

        new Button(this, "Quick Play", centerX, centerY - 60, () => this.quickPlay(), ButtonStyle.MainMenu);
        new Button(this, "Join Game", centerX, centerY, this.joinGame, ButtonStyle.MainMenu);
        new Button(this, "Create Game", centerX, centerY + 60, this.createGame, ButtonStyle.MainMenu);
    }
}