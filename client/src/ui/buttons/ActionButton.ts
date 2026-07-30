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
}