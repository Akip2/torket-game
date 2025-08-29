import Vector from "../data/Vector";
import { RessourceKeys } from "../enums/RessourceKeys.enum";
import type GameScene from "../scenes/GameScene";

export default class Bullet extends Phaser.Physics.Matter.Sprite {
    constructor(scene: GameScene, x: number, y: number) {
        super(scene.matter.world, x, y, RessourceKeys.Bullet);

        scene.add.existing(this);
        
        (this.body as MatterJS.BodyType).label = RessourceKeys.Bullet;
    }

    shoot(x: number, y: number, force: number) {
        const bulletVector = new Vector(
            x - this.x,
            y - this.y
        );

        const normalizedBulletVector = bulletVector.getNormalizedVector();

        this.setVelocity(normalizedBulletVector.x * (force), normalizedBulletVector.y * force);
    }
}