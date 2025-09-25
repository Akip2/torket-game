import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import type { IPlayer } from "@shared/interfaces/Player.interface";
import type GameScene from "../scenes/GameScene";

export default class PlayerClient extends Phaser.Physics.Matter.Sprite implements IPlayer {
    isMoving: boolean;
    isOnGround: boolean;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene.matter.world, x, y, RessourceKeys.Player);

        this.setFixedRotation();
        this.setFriction(0, 0.05, 0)

        scene.add.existing(this);
        (this.body as MatterJS.BodyType).label = RessourceKeys.Player;

        this.isMoving = false;
        this.isOnGround = false;
    }

    getPosition(): { x: number; y: number; } {
        return { x: this.x, y: this.y };
    }

    moveHorizontally(speed: number, instantly: boolean = false) {
        if (instantly) {
            this.setPosition(this.x + speed, this.y);
        } else {
            this.setVelocityX(speed);
        }
    }
}