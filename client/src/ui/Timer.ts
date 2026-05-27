import { GAME_WIDTH } from "@shared/const";
import type GameScene from "../scenes/GameScene";
import UiText from "./UiText";
import { TextStyle } from "./ui-styles";
import { Depths } from "@shared/enums/Depths.enum.ts";

export default class Timer extends UiText {
    background: Phaser.GameObjects.Rectangle;

    constructor(
        scene: GameScene,
    ) {
        const background = scene.add.rectangle(GAME_WIDTH / 2, 50, 0, 0, 0x091922, 0.85);
        scene.uiContainer.add(background);

        super(scene, "", GAME_WIDTH / 2, 48, TextStyle.Timer);
        this.setOrigin(0.5, 0);

        this.background = background
        scene.uiContainer.add(this.background);
        this.background.setStrokeStyle(2, 0xf5c971);
        this.background.setOrigin(0.5, 0);
        this.background.setDepth(Depths.First - 1);

        this.setDepth(Depths.First);
    }

    disable() {
        this.setText("");
        this.background?.setSize(0, 0);
    }

    update(timeLeft: number): void {
        const seconds = Math.ceil(timeLeft / 1000);
        this.setText(`${seconds}`);

        const padding = 10;
        const height = 26;
        this.background.setSize(this.width + padding, height);
        this.background.setPosition(this.x, this.y - 3);
    }
}