import type GameScene from "../../scenes/GameScene";
import UiButton from "./UiButton";
import { ButtonStyle } from "../ui-styles";

export default class EndTurnButton extends UiButton {
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
        super.disable();
        this.setAlpha(0.25);
    }

    public enable() {
        super.enable();
        this.setAlpha(0.7);
    }

    public hide() {
        this.setVisible(false);
    }

    public show() {
        this.setVisible(true);
    }
}