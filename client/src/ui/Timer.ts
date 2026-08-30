import type GameScene from "../scenes/GameScene";
import UiText from "./UiText";
import { TextStyle } from "./ui-styles";
import { Depths } from "../enums/Depths.enum";

export default class Timer extends UiText {
    background: Phaser.GameObjects.Rectangle;

    constructor(
        scene: GameScene,
    ) {
        const viewportCenter = scene.cameraManager.getUiViewportCenter();
        const background = scene.add.rectangle(viewportCenter.x, 50, 0, 0, 0x091922, 0.85);
        scene.uiContainer.add(background);

        super(scene, "", viewportCenter.x, 48, TextStyle.Timer);
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

        const viewportCenter = (this.scene as unknown as GameScene).cameraManager.getUiViewportCenter();
        const fixedWidth = 35;
        const height = 26;
        this.background.setSize(fixedWidth, height);

        this.setPosition(viewportCenter.x, this.y);
        this.background.setPosition(this.x, this.y - 3);
    }
}