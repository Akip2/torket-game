import { Action } from "@shared/enums/Action.enum";
import type GameScene from "../../scenes/GameScene";
import UiButton from "./UiButton";
import { ACTION_TO_STYLE } from "../ui-styles";

export default class ActionButton extends UiButton {
    constructor(scene: GameScene, x: number, y: number, action: Action, onClick: () => void) {
        const text = action.charAt(0).toUpperCase() + String(action).slice(1);
        const style = ACTION_TO_STYLE[action];

        super(scene, x, y, text, onClick, style);
    }

    appear(scene: GameScene, delay: number) {
        this.setScale(0);
        this.setAlpha(0);

        scene.tweens.add({
            targets: this,
            scale: 1,
            alpha: 1,
            duration: 400,
            delay: delay,
            ease: 'Back.easeOut'
        });
    }

    disappear(scene: GameScene, delay: number) {
        scene.tweens.add({
            targets: this,
            scale: 0.5,
            alpha: 0,
            duration: 250,
            ease: 'Quad.easeIn',
            delay: delay
        });
    }
}