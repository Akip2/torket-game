import { BULLET_CONST, PLAYER_CONST } from "@shared/const";
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
    }

    generatePlayerTexture(self: boolean = true, size = 32) {
        const g = this.factory.graphics();

        const baseColor = self ? PLAYER_CONST.SELF_COLOR : PLAYER_CONST.ENNEMY_COLOR;
        const borderColor = darkenHexColor(baseColor, 25);
        const key = self ? RessourceKeys.Player : RessourceKeys.PlayerEnnemy; 

        g.fillStyle(baseColor, 1);
        g.fillRect(0, 0, size, size);

        g.lineStyle(size / 4, borderColor, 1);
        g.strokeRect(0, 0, size, size);

        g.generateTexture(key, size, size);
        g.destroy();
    }

    generateBulletTexture(radius = BULLET_CONST.RADIUS) {
        const g = this.factory.graphics();

        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(radius, radius, radius);

        g.generateTexture(RessourceKeys.Bullet, radius * 2, radius * 2);
        g.destroy();
    }

    generateGunTexture(size = 35) {
        const g = this.factory.graphics();

        const tubeLength = size * 1.1;
        const tubeHeight = size * 0.25;
        const barrelY = size * 0.4;
        const muzzleLength = size * 0.15;
        const gripWidth = size * 0.15;
        const gripHeight = size * 0.18;

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