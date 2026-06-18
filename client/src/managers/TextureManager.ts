import { BULLET_CONST, CAPTURE_POINT_CONST, PLAYER_CONST } from "@shared/const";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { darkenHexColor } from "../client-utils";

export default class TextureManager {
    factory: Phaser.GameObjects.GameObjectFactory;

    constructor(factory: Phaser.GameObjects.GameObjectFactory) {
        this.factory = factory;
    }

    generateTextures() {
        this.generatePlayerTexture(true);
        this.generatePlayerTexture(false);
        this.generateBulletTexture();
        this.generateGunTexture();
        this.generateCapturePointTexture();
    }

    generatePlayerTexture(self: boolean = true, size = PLAYER_CONST.BASE_WIDTH) {
        const g = this.factory.graphics();

        const baseColor = self
            ? PLAYER_CONST.SELF_COLOR
            : PLAYER_CONST.ENNEMY_COLOR;

        const borderColor = darkenHexColor(baseColor, 25);

        const radius = 7.5;
        const borderWidth = size / 12;

        // fill
        g.fillStyle(baseColor, 1);
        g.fillRoundedRect(
            borderWidth / 2,
            borderWidth / 2,
            size - borderWidth,
            size - borderWidth,
            radius
        );

        // border
        g.lineStyle(borderWidth, borderColor, 1);
        g.strokeRoundedRect(
            borderWidth / 2,
            borderWidth / 2,
            size - borderWidth,
            size - borderWidth,
            radius
        );

        g.generateTexture(self ? RessourceKeys.Player : RessourceKeys.PlayerEnnemy, size, size);
        g.destroy();
    }

    generateBulletTexture(radius = BULLET_CONST.RADIUS) {
        const g = this.factory.graphics();

        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(radius, radius, radius);

        g.generateTexture(RessourceKeys.Bullet, radius * 2, radius * 2);
        g.destroy();
    }

    generateCapturePointTexture(radius = CAPTURE_POINT_CONST.RADIUS) {
        const g = this.factory.graphics();
        const size = radius * 2;
        const cx = radius;
        const cy = radius;

        g.fillStyle(0x555555, 1);
        g.fillCircle(cx, cy, radius);

        // Outer ring
        g.lineStyle(3, 0xFFFFFF, 0.9);
        g.strokeCircle(cx, cy, radius - 2);

        // Center dot
        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(cx, cy, 4);

        // Cross lines
        g.lineStyle(3, 0xFFFFFF, 0.6);
        g.lineBetween(cx - radius + 4, cy, cx + radius - 4, cy);
        g.lineBetween(cx, cy - radius + 4, cx, cy + radius - 4);

        g.generateTexture(RessourceKeys.CapturePoint, size, size);
        g.destroy();
    }

    generateGunTexture(size = 35) {
        const g = this.factory.graphics();

        const tubeLength = size * 1.1;
        const tubeHeight = size * 0.25;
        const barrelY = size * 0.4;
        const muzzleLength = size * 0.125;
        const gripWidth = size * 0.2;
        const gripHeight = size * 0.25;

        const lightBody = 0x5d6d7e;
        const muzzleColor = 0x34495e;
        const gripColor = 0x2e4053;

        const darken = (color: number, factor = 0.6) => {
            const r = ((color >> 16) & 0xff) * factor;
            const g_ = ((color >> 8) & 0xff) * factor;
            const b = (color & 0xff) * factor;
            return (r << 16) + (g_ << 8) + b;
        };

        g.lineStyle(2, darken(lightBody, 0.5), 1);
        g.fillStyle(lightBody, 1);
        g.fillRect(0, barrelY, tubeLength, tubeHeight);
        g.strokeRect(0, barrelY, tubeLength, tubeHeight);

        g.lineStyle(2, darken(muzzleColor, 0.5), 1);
        g.fillStyle(muzzleColor, 1);
        g.fillRect(tubeLength, barrelY - size * 0.05, muzzleLength, tubeHeight * 1.4);
        g.strokeRect(tubeLength, barrelY - size * 0.05, muzzleLength, tubeHeight * 1.4);

        g.lineStyle(2, darken(gripColor, 0.5), 1);
        g.fillStyle(gripColor, 1);
        g.fillRect(size * 0.25, barrelY + tubeHeight, gripWidth, gripHeight);
        g.strokeRect(size * 0.25, barrelY + tubeHeight, gripWidth, gripHeight);

        const totalWidth = tubeLength + muzzleLength + size * 0.2;
        g.generateTexture(RessourceKeys.Gun, totalWidth, size);
        g.destroy();
    }
}