import { RessourceKeys } from "../enums/RessourceKeys.enum";
import type GameScene from "../scenes/GameScene";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    isMoving: boolean;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, RessourceKeys.Player);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.isMoving = false;
    }

    checkForMovements(keyboard: Phaser.Types.Input.Keyboard.CursorKeys) {
        if (keyboard.left.isDown || keyboard.right.isDown) {
            this.isMoving = true;

            if (keyboard.left.isDown) { //Left
                this.setVelocityX(-160);
            } else { //Right
                this.setVelocityX(160);
            }
        } else if (this.isMoving) {
            this.isMoving = false;
            this.setVelocityX(0);
        }

        if (keyboard.up.isDown && this.body?.touching.down) {
            this.setVelocityY(-375);
        }
    }

    push(cx: number, cy: number, radius: number) {
        const dx = this.x - cx;
        const dy = this.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < radius) {
            let nx: number, ny: number;

            if (dist === 0) {
                console.log("ddddd")
                const angle = Math.random() * Math.PI * 2;
                nx = Math.cos(angle);
                ny = Math.sin(angle);
            } else {
                nx = dx / dist;
                ny = dy / dist;
            }

            const force = (1 - dist / radius) * (250 + (radius * 5) + Math.random() * 150);

            this.setVelocity(nx * force, ny * force);
        }
    }
}