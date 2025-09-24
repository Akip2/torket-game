import { RessourceKeys } from "../../../shared/enums/RessourceKeys.enum";
import type { BasicBody } from "../../../shared/interfaces/BasicBody";
import type GameScene from "../scenes/GameScene";

export default class BulletClient extends Phaser.Physics.Matter.Sprite implements BasicBody{
    constructor(scene: GameScene, x: number, y: number) {
        super(scene.matter.world, x, y, RessourceKeys.Bullet);

        scene.add.existing(this);
        
        (this.body as MatterJS.BodyType).label = RessourceKeys.Bullet;
    }

    getPosition(): { x: number; y: number; } {
        return {
            x: this.x,
            y: this.y
        }
    }
}