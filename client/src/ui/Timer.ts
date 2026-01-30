import { GAME_WIDTH } from "@shared/const";
import type GameScene from "../scenes/GameScene";
import UiText from "./UiText";
import { TextStyle } from "./ui-styles";
import { Depths } from "@shared/enums/Depths.eunum";

export default class Timer extends UiText {
    background: Phaser.GameObjects.Rectangle;

    constructor(
        scene: GameScene,
    ) {
        const background = scene.add.rectangle(GAME_WIDTH / 2, 55, 80, 50, 0x1a1a1a, 0.7);
        scene.uiContainer.add(background);

        super(scene, "", GAME_WIDTH / 2, 65, TextStyle.Timer);
        this.setOrigin(0, 0);

        this.background = background
        scene.uiContainer.add(this.background);
        this.background.setStrokeStyle(2, 0xff8844);
        this.background.setOrigin(0.5, 0);
        this.background.setDepth(Depths.First - 1);

        this.setOrigin(0.5, 0);
        this.setDepth(Depths.First);
    }

    disable() {
        this.setText("");
        this.background?.setSize(0, 0);
    }

    update(timeLeft: number): void {
        const seconds = Math.ceil(timeLeft / 1000);
        this.setText(`${seconds}`);

        const padding = 15;
        this.background.setSize(31 + padding, 50);
        this.background.y = 55;
    }
}