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

    constructor(scene: GameScene, x: number, y: number) {
        this.maxBullets = PLAYER_CONST.BASE_MAX_BULLET_COUNT;
        this.spacing = (BarStyle.Health.width / this.maxBullets);

        for (let i = 0; i < this.maxBullets; i++) {
            const sprite = new Phaser.GameObjects.Image(
                scene,
                0,
                0,
                RessourceKeys.Bullet
            ).setDepth(Depths.First);
            this.sprites.push(sprite);
            this.updatePlacement(x, y);

            scene.add.existing(sprite);
        }

        this.updateBulletCount(0);
    }

    updateDisplay() {
        this.sprites.forEach((sprite, i) => {
            const isFull = i < this.bulletCount;
            sprite.setTint(
                isFull
                    ? 0xFFFFFF
                    : 0xAAAAAA
            );

            sprite.setAlpha(
                isFull
                    ? 0.85
                    : 0.5
            )
        });
    }

    updateBulletCount(count: number) {
        this.bulletCount = Math.max(0, Math.min(count, this.maxBullets));
        this.updateDisplay();
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