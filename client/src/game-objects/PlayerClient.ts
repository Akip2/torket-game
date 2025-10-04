import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import type { IPlayer } from "@shared/interfaces/Player.interface";
import type GameScene from "../scenes/GameScene";
import Gun from "./Gun";

export default class PlayerClient extends Phaser.Physics.Matter.Sprite implements IPlayer {
    isMoving: boolean;
    isOnGround: boolean;

    gun: Gun;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene.matter.world, x, y, RessourceKeys.Player);

        this.setFixedRotation();
        this.setFriction(0, 0.05, 0)

        scene.add.existing(this);
        (this.body as MatterJS.BodyType).label = RessourceKeys.Player;

        this.isMoving = false;
        this.isOnGround = false;

        this.gun = new Gun(scene, x, y);
    }

    updateGunPlacement(targetPosition: { x: number, y: number }) {
        const dx = targetPosition.x - this.x;
        const dy = targetPosition.y - this.y;
        const angle = Math.atan2(dy, dx);


        this.gun.setPosition(this.x, this.y);
        this.gun.setAngle(angle * 180 / Math.PI);
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