import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import type GameScene from "../scenes/GameScene";
import { PLAYER_CONST } from "@shared/const";
import { Depths } from "../enums/Depths.enum";

export class Glow extends Phaser.GameObjects.Image {
    constructor(scene: GameScene, x: number, y: number, self: boolean) {
        super(scene, x, y, RessourceKeys.Glow);
        this.setTint(self ? PLAYER_CONST.SELF_COLOR : PLAYER_CONST.ENNEMY_COLOR)
            .setAlpha(0.4)
            .setBlendMode(Phaser.BlendModes.ADD);

        this.setDepth(Depths.Player - 1);
        scene.add.existing(this);
        scene.tweens.add({
            targets: this,
            alpha: { from: 0.3, to: 0.425 },
            scale: { from: 1.4, to: 1.6 },
            duration: 2000,
            ease: "Sine.easeInOut",
            repeat: -1,
            yoyo: true
        });
    }
}