import { PLAYER_CONST } from "../../../shared/const";
import Vector from "../../../shared/data/Vector";
import { RessourceKeys } from "../../../shared/enums/RessourceKeys.enum";
import type GameScene from "../scenes/GameScene";

export default class Player extends Phaser.Physics.Matter.Sprite {
    isMoving: boolean;
    isOnGround: boolean;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene.matter.world, x, y, RessourceKeys.Player);

        this.setFixedRotation();
        this.setFriction(0,0.05,0)

        scene.add.existing(this);
        (this.body as MatterJS.BodyType).label = RessourceKeys.Player;

        this.isMoving = false;
        this.isOnGround = false;
    }

    canJump() {
        if (this.body == null) return false;
        return Math.abs(this.body.velocity.y) < 0.1 && this.isOnGround;
    }

    checkForMovements(keyboard: Phaser.Types.Input.Keyboard.CursorKeys) {
        if (keyboard.left.isDown || keyboard.right.isDown) {
            this.isMoving = true;

            if (keyboard.left.isDown) { //Left
                this.setVelocityX(-PLAYER_CONST.SPEED);
            } else { //Right
                this.setVelocityX(PLAYER_CONST.SPEED);
            }
        } else if (this.isMoving) {
            this.isMoving = false;
            this.setVelocityX(0);
        }

        if (keyboard.up.isDown && this.canJump()) {
            this.isOnGround = false;
            this.setVelocityY(PLAYER_CONST.JUMP);
        }
    }

    push(cx: number, cy: number, radius: number) {
        const pushVector = new Vector(this.x - cx, this.y - cy);
        const dist = pushVector.getNorm();

        if (dist < radius) {
            let normalizedPushVector: Vector;

            if (dist === 0) {
                const angle = Math.random() * Math.PI * 2;
                normalizedPushVector = new Vector(Math.cos(angle), Math.sin(angle));
            } else {
                normalizedPushVector = pushVector.getNormalizedVector();
            }
            const force = (1 - dist / radius) * (10 + radius / 2.5);

            this.setVelocity(normalizedPushVector.x * force, normalizedPushVector.y * force);
        }
    }
}