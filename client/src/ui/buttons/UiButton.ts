import type { UIButtonStyle } from "@shared/types";
import type GameScene from "../../scenes/GameScene";
import tinycolor from "tinycolor2";

export default class UiButton extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Rectangle;
    private label: Phaser.GameObjects.Text;
    private baseColor: number;

    constructor(
        scene: GameScene,
        x: number,
        y: number,
        text: string,
        onClick: () => void,
        style: UIButtonStyle
    ) {
        super(scene, x, y);

        this.baseColor = style.backgroundColor;

        this.bg = scene.add.rectangle(
            0,
            0,
            style.width,
            style.height,
            style.backgroundColor
        );

        if (style.borderColor && style.borderThickness) {
            this.bg.setStrokeStyle(style.borderThickness, style.borderColor);
        }

        this.bg.setInteractive({ useHandCursor: true });

        this.label = scene.add.text(0, 0, text, style.text);
        this.label.setOrigin(0.5);

        this.add([this.bg, this.label]);

        this.bg.on('pointerover', () => {
            const lighter = tinycolor(this.baseColor.toString(16)).lighten(7.5).toHexString().replace("#", "");
            this.bg.setFillStyle(parseInt(lighter, 16));
        });

        this.bg.on('pointerout', () => {
            this.bg.setFillStyle(this.baseColor);
        });

        this.bg.on('pointerdown', onClick);

        scene.add.existing(this);
    }
}