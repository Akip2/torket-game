import type { UIButtonStyle } from "@shared/types";
import type GameScene from "../../scenes/GameScene";
import { lightenHexColor, darkenHexColor } from "../../client-utils";

export default class UiButton extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Rectangle;
    private glowBg?: Phaser.GameObjects.Rectangle;
    private shadowBg?: Phaser.GameObjects.Rectangle;
    private label: Phaser.GameObjects.Text;
    private baseColor: number;
    private borderColor: number;
    private originalText: string;
    private loadingSpinner?: Phaser.GameObjects.Arc;
    private loadingTween?: Phaser.Tweens.Tween;
    private wasEnabledBeforeLoading: boolean = true;
    protected isEnabled: boolean = true;
    private glowTween?: Phaser.Tweens.Tween;
    private isPointerOver: boolean = false;

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
        this.borderColor = style.borderColor || 0xffffff;

        this.shadowBg = scene.add.rectangle(
            3,
            3,
            style.width,
            style.height,
            0x000000,
            0.4
        );
        this.add(this.shadowBg);

        // Create glow background (for hover effect)
        this.glowBg = scene.add.rectangle(
            0,
            0,
            style.width + 10,
            style.height + 10,
            this.borderColor,
            0
        );
        this.glowBg.setDepth(-1);
        this.add(this.glowBg);

        // Main background
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

        this.add([this.glowBg, this.bg, this.label]);

        // Setup hover effects with glow
        this.bg.on('pointerover', () => {
            if (!this.isEnabled) return;
            
            this.isPointerOver = true;

            console.log(this.baseColor);
            this.bg.setFillStyle(lightenHexColor(this.baseColor));
            
            // Glow animation
            if (this.glowTween) this.glowTween.stop();
            this.glowTween = (this.scene as GameScene).tweens.add({
                targets: this.glowBg,
                alpha: 0.6,
                duration: 200,
                ease: 'Quad.easeOut'
            });

            // Scale up smoothly
            (this.scene as GameScene).tweens.add({
                targets: this,
                scale: 1.12,
                duration: 200,
                ease: 'Quad.easeOut'
            });
        });

        this.bg.on('pointerout', () => {
            if (!this.isEnabled) return;
            
            this.isPointerOver = false;
            this.bg.setFillStyle(this.baseColor);
            
            // Fade glow
            if (this.glowTween) this.glowTween.stop();
            this.glowTween = (this.scene as GameScene).tweens.add({
                targets: this.glowBg,
                alpha: 0,
                duration: 300,
                ease: 'Quad.easeIn'
            });

            // Scale back
            (this.scene as GameScene).tweens.add({
                targets: this,
                scale: 1,
                duration: 200,
                ease: 'Quad.easeOut'
            });
        });

        this.bg.on('pointerdown', () => {
            if (!this.isEnabled) return;

            // Press effect
            (this.scene as GameScene).tweens.add({
                targets: this,
                scale: 0.96,
                duration: 80,
                ease: 'Quad.easeIn'
            });

            this.createClickPulse(scene);
            const possiblePromise = onClick();
            if (possiblePromise instanceof Promise) {
                this.setLoading(true);
                possiblePromise.finally(() => this.setLoading(false));
            }
        });

        this.bg.on('pointerup', () => {
            if (!this.isEnabled) return;
            // Return to hover/normal scale
            (this.scene as GameScene).tweens.add({
                targets: this,
                scale: this.isPointerOver ? 1.12 : 1,
                duration: 150,
                ease: 'Quad.easeOut'
            });
        });

        scene.add.existing(this);
        
        // Subtle idle pulse animation
        this.createIdlePulse(scene);
    }

    private createIdlePulse(scene: GameScene) {
        scene.tweens.add({
            targets: this.glowBg,
            alpha: 0.1,
            yoyo: true,
            repeat: -1,
            duration: 2500,
            ease: 'Sine.easeInOut'
        });
    }

    private createLoadingSpinner(scene: GameScene, width: number) {
        this.loadingSpinner = scene.add.arc(
            -width / 4,
            0,
            10,
            0,
            270,
            false,
            0xffffff,
            0
        );
        this.loadingSpinner.setStrokeStyle(3, 0xffffff, 0.95);
        this.loadingSpinner.setVisible(false);
        this.add(this.loadingSpinner);

        this.loadingTween = scene.tweens.add({
            targets: this.loadingSpinner,
            angle: 360,
            duration: 600,
            repeat: -1,
            ease: 'Linear',
            paused: true
        });
    }

    public disable() {
        this.isEnabled = false;
        this.setAlpha(0.4);
        this.bg.disableInteractive();
        this.bg.setFillStyle(darkenHexColor(this.baseColor));
        if (this.glowTween) this.glowTween.stop();
        if (this.glowBg) this.glowBg.setAlpha(0);
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
            this.label.setText("...");
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
        // Create multiple ripple effects
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const pulse = scene.add.circle(
                    this.x,
                    this.y,
                    15,
                    this.borderColor,
                    0.5
                );
                pulse.setDepth(this.depth - 1);

                scene.tweens.add({
                    targets: pulse,
                    radius: 80,
                    alpha: 0,
                    duration: 500,
                    ease: 'Quad.easeOut',
                    onComplete: () => pulse.destroy()
                });
            }, i * 100);
        }
    }
}