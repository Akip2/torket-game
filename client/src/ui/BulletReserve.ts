import type GameScene from "../scenes/GameScene";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { BULLET_RESERVE_CONST, PLAYER_CONST } from "@shared/const";
import { Depths } from "@shared/enums/Depths.enum.ts";
import { BarStyle } from "./ui-styles";

export default class BulletReserve {
    private sprites: Phaser.GameObjects.Image[] = [];
    private bulletCount!: number;
    private maxBullets: number;
    private spacing: number;
    private scene: GameScene;

    constructor(scene: GameScene, x: number, y: number) {
        this.scene = scene;

        this.maxBullets = PLAYER_CONST.BASE_MAX_BULLET_COUNT;
        this.spacing = BarStyle.Health.width / this.maxBullets;

        for (let i = 0; i < this.maxBullets; i++) {
            const sprite = new Phaser.GameObjects.Image(
                scene,
                0,
                0,
                RessourceKeys.Bullet
            ).setDepth(Depths.PlayerUi);

            this.sprites.push(sprite);
            this.updatePlacement(x, y);

            scene.add.existing(sprite);
        }

        this.updateBulletCount(0);
    }

    updateBulletCount(count: number) {
        const previousCount = this.bulletCount ?? 0;
        const newCount = Math.max(
            0,
            Math.min(count, this.maxBullets)
        );

        if (newCount === previousCount) {
            return;
        }

        this.bulletCount = newCount;

        this.updateDisplay(previousCount);
    }

    private updateDisplay(previousCount?: number) {
        this.sprites.forEach((sprite, i) => {
            const isFull = i < this.bulletCount;

            sprite.setTint(isFull ? 0xFFFFFF : 0xAAAAAA);
            sprite.setAlpha(isFull ? 0.85 : 0.5);

            if (previousCount !== undefined) {
                const wasFull = i < previousCount;

                if (wasFull !== isFull) {
                    this.animateBulletChange(sprite, isFull, i);
                }
            }
        });
    }

    private animateBulletChange(
        sprite: Phaser.GameObjects.Image,
        gained: boolean,
        index: number
    ) {
        this.scene.tweens.killTweensOf(sprite);

        const targetAlpha = gained ? 0.85 : 0.5;
        const delay = index * 40;

        if (gained) {
            sprite.setAlpha(0);
            sprite.setScale(0.4);

            this.scene.tweens.add({
                targets: sprite,
                alpha: targetAlpha,
                scale: 1,
                duration: 250,
                delay,
                ease: "Back.easeOut"
            });
        } else {
            this.scene.tweens.add({
                targets: sprite,
                alpha: 0.15,
                scale: 1.25,
                duration: 120,
                ease: "Quad.easeOut",
                yoyo: true,
                onComplete: () => {
                    sprite.setAlpha(targetAlpha);
                    sprite.setScale(1);
                }
            });
        }
    }

    updatePlacement(x: number, y: number) {
        const startX = x - BarStyle.Health.width / 2;

        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].setPosition(
                startX + this.spacing * (i + 0.5),
                y + BarStyle.Health.marginY - BULLET_RESERVE_CONST.RADIUS - 4.5
            );
        }
    }

    destroy(fromScene?: boolean) {
        this.sprites.forEach(s => s.destroy(fromScene));
        this.sprites = [];
    }
}