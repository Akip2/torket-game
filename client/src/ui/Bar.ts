import type GameScene from "../scenes/GameScene";
import type { BarStyleType } from "@shared/types";

export default class Bar extends Phaser.GameObjects.Graphics {
    lastX?: number;
    lastY?: number;
    lastValue?: number;

    style: BarStyleType;

    constructor(
        scene: GameScene,
        x: number = 0,
        y: number = 0,
        value: number = 1,
        style: BarStyleType
    ) {
        super(scene);

        this.style = style;

        scene.add.existing(this);

        this.updateGraphics(x, y, value);
        this.setDepth(200);
    }

    updateGraphics(x: number, y: number, value: number) {
        if (x == this.lastX && this.lastY == y && this.lastValue == value) return; // if no changes we don't redraw

        this.lastValue = value;
        this.lastX = x;
        this.lastY = y;

        this.clear();

        const adjustedX = x + this.style.marginX - this.style.width / 2;
        const adjustedY = y + this.style.marginY - this.style.height / 2;

        this.fillStyle(this.style.backgroundColor);
        this.fillRect(adjustedX, adjustedY, this.style.width, this.style.height);

        if (value > 0) {
            this.fillStyle(0x00ff00);
            const d = Math.floor(this.style.width * value);

            this.fillRect(adjustedX, adjustedY, d, this.style.height);
        }
    }
}