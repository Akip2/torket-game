import { RessourceKeys } from "../enums/RessourceKeys.enum";
import type GameScene from "../scenes/GameScene";

export default class Player {
    dynamicBody: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    constructor(scene: GameScene, x: number, y: number) {
        this.generatePlayerTexture(scene);

        this.dynamicBody = scene.physics.add.sprite(
            x,
            y,
            RessourceKeys.Player
        );
    }

    generatePlayerTexture(scene: GameScene, size = 32, baseColor = 0x3498db) {
        const g = scene.add.graphics();

        g.fillStyle(baseColor, 1);
        g.fillRect(0, 0, size, size);

        g.lineStyle(size / 4, 0x21618c, 1);
        g.strokeRect(0, 0, size, size);

        g.generateTexture(RessourceKeys.Player, size, size);
        g.destroy();
    }

    checkPlayerMovements(keyboard: Phaser.Types.Input.Keyboard.CursorKeys) {
        if (keyboard.left.isDown) {
            this.dynamicBody.setVelocityX(-160);
        }
        else if (keyboard.right.isDown) {
            this.dynamicBody.setVelocityX(160);
        }
        else {
            this.dynamicBody.setVelocityX(0);
        }

        if (keyboard.up.isDown && this.dynamicBody.body.touching.down) {
            this.dynamicBody.setVelocityY(-375);
        }
    }
}