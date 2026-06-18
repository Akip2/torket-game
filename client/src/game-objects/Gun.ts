import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import type GameScene from "../scenes/GameScene";
import { Depths } from "@shared/enums/Depths.enum.ts";

export default class Gun extends Phaser.Physics.Matter.Sprite {
    constructor(scene: GameScene, x: number, y: number) {
        super(scene.matter.world, x, y, RessourceKeys.Gun);

        scene.worldContainer.add(this);

        this.setIgnoreGravity(true);
        this.setCollidesWith([]);

        this.setDepth(Depths.First);
        this.setOrigin(0.25, 0.5);
        this.setAlpha(0.9)
    }

    updateDisplay(px: number, py: number, dx: number, dy: number) {
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;
        const angleRad = Math.atan2(dy, dx);
        const orbitRadius = 32 * Math.abs(this.scaleX);
        const gunX = px + Math.cos(angleRad) * orbitRadius;
        const gunY = py + Math.sin(angleRad) * orbitRadius;

        if (Math.abs(angle) > 90) {
            this.setScale(Math.abs(this.scaleX), -Math.abs(this.scaleY));
        } else {
            this.setScale(Math.abs(this.scaleX), Math.abs(this.scaleY));
        }

        this.setPosition(gunX, gunY);
        this.setAngle(angle);
    }
}