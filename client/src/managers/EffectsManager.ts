import type GameScene from "../scenes/GameScene";
import { Depths } from "@shared/enums/Depths.eunum";

export default class EffectsManager {
    private scene: GameScene;

    constructor(scene: GameScene) {
        this.scene = scene;
    }

    /**
     * Screen shake effect
     */
    screenshake(intensity: number = 5, duration: number = 200) {
        const originalX = this.scene.cameras.main.scrollX;
        const originalY = this.scene.cameras.main.scrollY;

        let elapsed = 0;
        const shakeInterval = setInterval(() => {
            elapsed += 16;

            const randomX = (Math.random() - 0.5) * intensity;
            const randomY = (Math.random() - 0.5) * intensity;

            this.scene.cameras.main.setScroll(originalX + randomX, originalY + randomY);

            if (elapsed >= duration) {
                clearInterval(shakeInterval);
                this.scene.cameras.main.setScroll(originalX, originalY);
            }
        }, 16);
    }

    /**
     * Flash effect - white screen flash
     */
    flash(color: number = 0xffffff, duration: number = 150, intensity: number = 0.6) {
        const flash = this.scene.add.rectangle(
            this.scene.cameras.main.centerX,
            this.scene.cameras.main.centerY,
            this.scene.cameras.main.width,
            this.scene.cameras.main.height,
            color,
            intensity
        );
        flash.setDepth(Depths.First);
        flash.setScrollFactor(0);
        this.scene.uiContainer.add(flash);

        this.scene.tweens.add({
            targets: flash,
            alpha: 0,
            duration,
            ease: 'Quad.easeOut',
            onComplete: () => flash.destroy()
        });
    }

    /**
     * Burst particle effect from a position
     */
    burstParticles(x: number, y: number, count: number = 8, color: number = 0xffffff) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;

            const particle = this.scene.add.circle(x, y, 3, color, 0.8);
            particle.setDepth(Depths.Second);

            this.scene.tweens.add({
                targets: particle,
                x: x + Math.cos(angle) * 100,
                y: y + Math.sin(angle) * 100,
                alpha: 0,
                scale: 0.5,
                duration: 400,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    /**
     * Damage number floating effect
     */
    damageNumber(x: number, y: number, value: number, isCrit: boolean = false) {
        const color = isCrit ? '#ff0000' : '#ffffff';
        const size = isCrit ? '32px' : '24px';

        const text = this.scene.add.text(x, y, value.toString(), {
            fontSize: size,
            color,
            fontStyle: isCrit ? 'bold' : 'normal',
            fontFamily: 'Arial'
        });
        text.setOrigin(0.5);
        text.setDepth(Depths.Second);
        this.scene.worldContainer.add(text);

        this.scene.tweens.add({
            targets: text,
            y: y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Quad.easeOut',
            onComplete: () => text.destroy()
        });
    }

    /**
     * Hit flash - quick color change
     */
    hitFlash(target: any, color: number = 0xff0000, duration: number = 100) {
        if (!target.setTint) return;

        target.setTint(color);
        this.scene.time.delayedCall(duration, () => {
            target.clearTint();
        });
    }

    /**
     * Spinning/loading effect
     */
    spinningLoader(x: number, y: number, size: number = 20, duration: number = 1000): Phaser.GameObjects.Graphics {
        const graphics = this.scene.add.graphics();
        graphics.setDepth(Depths.Second);

        this.scene.tweens.add({
            targets: graphics,
            rotation: Math.PI * 2,
            duration,
            repeat: -1,
            ease: 'Linear'
        });

        const draw = () => {
            graphics.clear();
            graphics.lineStyle(2, 0x00ff00);
            graphics.beginPath();
            graphics.arc(x, y, size, 0, Math.PI * 1.5, false);
            graphics.strokePath();
        };

        this.scene.events.on('update', draw);
        return graphics;
    }
}
