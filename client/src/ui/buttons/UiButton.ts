import type { UIButtonStyle } from "@shared/types";
import type GameScene from "../../scenes/GameScene";
import { lightenHexColor } from "../../client-utils";

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
            this.bg.setFillStyle(lightenHexColor(this.baseColor));
            // Scale up on hover
            (this.scene as GameScene).tweens.add({
                targets: this,
                scale: 1.1,
                duration: 150,
                ease: 'Quad.easeOut'
            });
        });

        this.bg.on('pointerout', () => {
            this.bg.setFillStyle(this.baseColor);
            // Scale back down
            (this.scene as GameScene).tweens.add({
                targets: this,
                scale: 1,
                duration: 150,
                ease: 'Quad.easeOut'
            });
        });

        this.bg.on('pointerdown', () => {
            // Click pulse effect
            this.createClickPulse(scene);
            onClick();
        });

        scene.add.existing(this);
    }

    private createClickPulse(scene: GameScene) {
        // Create a small pulse/glow on click
        const pulse = scene.add.circle(
            this.x,
            this.y,
            30,
            0xffffff,
            0.3
        );
        pulse.setDepth(this.depth - 1);

        scene.tweens.add({
            targets: pulse,
            radius: 60,
            alpha: 0,
            duration: 300,
            ease: 'Quad.easeOut',
            onComplete: () => pulse.destroy()
        });
    }
}