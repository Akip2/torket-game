import Vector from "../data/Vector";
import { RessourceKeys } from "../enums/RessourceKeys.enum";
import type GameScene from "../scenes/GameScene";

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, RessourceKeys.Bullet);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        scene.physics.add.collider(scene.terrainColliders, this);
    }

    shoot(x: number, y: number, force: number) {
        const bulletVector = new Vector(
            x - this.x,
            y - this.y
        );

        const normalizedBulletVector = bulletVector.getNormalizedVector();

        this.setVelocity(normalizedBulletVector.x * (force / 1.5), normalizedBulletVector.y * force);
    }
}