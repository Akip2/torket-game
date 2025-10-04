import { BULLER_CONST } from "@shared/const";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";

export default class TextureManager {
    factory: Phaser.GameObjects.GameObjectFactory;

    constructor(factory: Phaser.GameObjects.GameObjectFactory) {
        this.factory = factory;
    }

    generateTextures() {
        this.generatePlayerTexture();
        this.generateBulletTexture();
        this.generateGunTexture();
    }

    generatePlayerTexture(size = 32, baseColor = 0x3498db) {
        const g = this.factory.graphics();

        g.fillStyle(baseColor, 1);
        g.fillRect(0, 0, size, size);

        g.lineStyle(size / 4, 0x21618c, 1);
        g.strokeRect(0, 0, size, size);

        g.generateTexture(RessourceKeys.Player, size, size);
        g.destroy();
    }

    generateBulletTexture(radius = BULLER_CONST.RADIUS) {
        const g = this.factory.graphics();

        g.fillStyle(0xFFFFFF, 1);
        g.fillCircle(radius, radius, radius);

        g.generateTexture(RessourceKeys.Bullet, radius * 2, radius * 2);
        g.destroy();
    }

    generateGunTexture(size = 40) {
        const g = this.factory.graphics();

        const tubeLength = size * 1.1;
        const tubeHeight = size * 0.25;
        const barrelY = size * 0.4;

        g.fillStyle(0x2c3e50, 1);
        g.fillRect(0, barrelY, tubeLength, tubeHeight);

        const muzzleLength = size * 0.15;
        g.fillStyle(0x1b2631, 1);
        g.fillRect(tubeLength, barrelY - size * 0.05, muzzleLength, tubeHeight * 1.4);

        const gripWidth = size * 0.15;
        const gripHeight = size * 0.18;
        g.fillStyle(0x212f3c, 1);
        g.fillRect(size * 0.25, barrelY + tubeHeight, gripWidth, gripHeight);

        const totalWidth = tubeLength + muzzleLength + size * 0.2;
        g.generateTexture(RessourceKeys.Gun, totalWidth, size);
        g.destroy();
    }
}