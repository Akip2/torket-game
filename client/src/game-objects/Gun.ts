import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import type GameScene from "../scenes/GameScene";
import { Depths } from "@shared/enums/Depths.eunum";

export default class Gun extends Phaser.Physics.Matter.Sprite {
    constructor(scene: GameScene, x: number, y: number) {
        super(scene.matter.world, x, y, RessourceKeys.Gun);

        scene.add.existing(this);

        this.setIgnoreGravity(true);
        this.setCollidesWith([]);

        this.setDepth(Depths.First);
        this.setOrigin(0.25, 0.5);
        this.setAlpha(0.9)
    }
}