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
}