import { PLAYER_CONST } from "@shared/const";
import type GameScene from "../scenes/GameScene";
import { Depths } from "@shared/enums/Depths.eunum";

export default class NameTag extends Phaser.GameObjects.Text {
    constructor(scene: GameScene, name: string, playerX: number, playerY: number) {
        super(scene, playerX, playerY + PLAYER_CONST.WIDTH + 10, name, {
            fontFamily: "Arial",
            color: "white",
        });

        this.setOrigin(0.5);
        this.setDepth(Depths.First);

        scene.add.existing(this);
    }

    updatePlacement(playerX: number, playerY: number) {
        this.x = playerX;
        this.y = playerY + PLAYER_CONST.WIDTH + 2.5;
    }
}