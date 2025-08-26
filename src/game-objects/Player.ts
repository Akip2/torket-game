import { RessourceKeys } from "../enums/RessourceKeys.enum";
import type GameScene from "../scenes/GameScene";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, RessourceKeys.Player);

        scene.add.existing(this);
        scene.physics.add.existing(this);
    }

    checkForMovements(keyboard: Phaser.Types.Input.Keyboard.CursorKeys) {
        if (keyboard.left.isDown) {
            this.setVelocityX(-160);
        }
        else if (keyboard.right.isDown) {
            this.setVelocityX(160);
        }
        else {
            this.setVelocityX(0);
        }

        if (keyboard.up.isDown && this.body?.touching.down) {
            this.setVelocityY(-375);
        }
    }
}