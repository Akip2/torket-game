import type { UIButtonStyle } from "@shared/types";
import type GameScene from "../../scenes/GameScene";
import { lightenHexColor, darkenHexColor } from "../../client-utils";

export default class UiButton extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Rectangle;
    private label: Phaser.GameObjects.Text;
    private baseColor: number;
    private originalText: string;
    private loadingSpinner?: Phaser.GameObjects.Arc;
    private loadingTween?: Phaser.Tweens.Tween;
    private wasEnabledBeforeLoading: boolean = true;
    protected isEnabled: boolean = true;

    constructor(
        scene: GameScene,
        x: number,
        y: number,
        text: string,
        onClick: () => void | Promise<void>,
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
        this.originalText = text;
        this.createLoadingSpinner(scene, style.width);

        this.add([this.bg, this.label]);

        this.bg.on('pointerover', () => {
            if (!this.isEnabled) return;
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
            if (!this.isEnabled) return;
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
            if (!this.isEnabled) return;

            this.createClickPulse(scene);
            const possiblePromise = onClick();
            if (possiblePromise instanceof Promise) {
                this.setLoading(true);
                possiblePromise.finally(() => this.setLoading(false));
            }
        });

        scene.add.existing(this);
    }

    private createLoadingSpinner(scene: GameScene, width: number) {
        this.loadingSpinner = scene.add.arc(
            -width / 4,
            0,
            8,
            0,
            270,
            false,
            0xffffff,
            0
        );
        this.loadingSpinner.setStrokeStyle(2, 0xffffff, 0.9);
        this.loadingSpinner.setVisible(false);
        this.add(this.loadingSpinner);

        this.loadingTween = scene.tweens.add({
            targets: this.loadingSpinner,
            angle: 360,
            duration: 700,
            repeat: -1,
            ease: 'Linear',
            paused: true
        });
    }

    public disable() {
        this.isEnabled = false;
        this.setAlpha(0.5);
        this.bg.disableInteractive();
        this.bg.setFillStyle(darkenHexColor(this.baseColor));
    }

    public enable() {
        this.isEnabled = true;
        this.setAlpha(1);
        this.bg.setInteractive({ useHandCursor: true });
        this.bg.setFillStyle(this.baseColor);
    }

    public setLoading(loading: boolean) {
        if (loading) {
            this.wasEnabledBeforeLoading = this.isEnabled;
            this.disable();
            this.label.setText("Loading");
            if (this.loadingSpinner) {
                this.loadingSpinner.setVisible(true);
                this.loadingTween?.play();
            }
            return;
        }

        if (this.wasEnabledBeforeLoading) {
            this.enable();
        }
        this.label.setText(this.originalText);
        if (this.loadingSpinner) {
            this.loadingSpinner.setVisible(false);
            this.loadingTween?.pause();
            if (this.loadingSpinner) this.loadingSpinner.angle = 0;
        }
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