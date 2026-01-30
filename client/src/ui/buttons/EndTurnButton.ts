import type GameScene from "../../scenes/GameScene";
import UiButton from "./UiButton";
import { ButtonStyle } from "../ui-styles";

export default class EndTurnButton extends UiButton {
    private isEnabled: boolean = true;

    constructor(scene: GameScene, x: number, y: number, onClick: () => void) {
        super(
            scene,
            x,
            y,
            "END TURN",
            () => {
                if (this.isEnabled) onClick();
            },
            ButtonStyle.EndTurnButton
        );

        this.hide();
    }

    public disable() {
        this.isEnabled = false;
        this.setAlpha(0.25);
        (this as any).bg.disableInteractive();
    }

    public enable() {
        this.isEnabled = true;
        this.setAlpha(0.7);
        (this as any).bg.setInteractive({ useHandCursor: true });
    }

    public hide() {
        this.setVisible(false);
    }

    public show() {
        this.setVisible(true);
    }
}