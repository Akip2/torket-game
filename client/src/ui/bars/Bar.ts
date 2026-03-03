import { Depths } from "@shared/enums/Depths.eunum";
import type { BarStyleType } from "@shared/types";
import type GameScene from "client/src/scenes/GameScene";

export default class Bar extends Phaser.GameObjects.Graphics {
    lastX?: number;
    lastY?: number;

    lastValue?: number;
    displayValue: number = 1;

    transitionDuration: number;

    style: BarStyleType;

    constructor(
        scene: GameScene,
        x: number = 0,
        y: number = 0,
        value: number = 1,
        style: BarStyleType,
        transitionDuration: number = 0
    ) {
        super(scene);

        this.style = style;

        scene.add.existing(this);

        this.updateGraphics(x, y, value);

        this.setDepth(this.style.depth ?? Depths.None);
        this.setAlpha(this.style.opacity ?? 1);

        this.transitionDuration = transitionDuration;
    }

    updateGraphics(x: number, y: number, value: number) {
        try {
            if (this.lastValue !== value) {
                this.lastValue = value;
                this.scene.tweens.killTweensOf(this);

                // Animate the display value
                this.scene.tweens.add({
                    targets: this,
                    displayValue: value,
                    duration: this.transitionDuration,
                    ease: 'Quad.easeOut',
                    onUpdate: () => {
                        // Redraw as we animate
                        this.redraw(x, y);
                    }
                });
            }

            this.redraw(x, y);
            this.lastX = x;
            this.lastY = y;
        } catch (error) {

        }
    }

    protected getCustomBarColor(_percentage: number): number {
        return this.style.mainColor;
    }

    private redraw(x: number, y: number) {
        this.clear();

        const adjustedX = x + this.style.marginX - this.style.width / 2;
        const adjustedY = y + this.style.marginY - this.style.height / 2;
        const borderRadius = 3;

        // Background (dark)
        this.fillStyle(this.style.backgroundColor);
        this.fillRoundedRect(adjustedX, adjustedY, this.style.width, this.style.height, borderRadius);

        if (this.displayValue > 0) {
            const barColor = this.getCustomBarColor(this.displayValue);
            this.fillStyle(barColor);
            const fillWidth = Math.max(1, Math.floor(this.style.width * this.displayValue));
            this.fillRoundedRect(adjustedX, adjustedY, fillWidth, this.style.height, borderRadius);

            this.fillStyle(0xffffff, 0.2);
            this.fillRect(adjustedX, adjustedY, fillWidth, Math.floor(this.style.height * 0.4));
        }

        this.lineStyle(2, this.style.borderColor, 1);
        this.strokeRoundedRect(adjustedX, adjustedY, this.style.width, this.style.height, borderRadius);
    }
}