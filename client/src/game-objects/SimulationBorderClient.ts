import { DEBUG } from "@shared/const";
import type GameScene from "../scenes/GameScene";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";

export default class SimulationBorderClient extends Phaser.GameObjects.Rectangle {
    constructor(scene: GameScene, x: number, y: number, width: number, height: number) {
        super(scene, x, y, width, height, DEBUG ? 0xFF0000 : undefined);

        scene.add.existing(this);

        scene.matter.add.gameObject(this, {
            isStatic: true
        });

        (this.body as MatterJS.BodyType).label = RessourceKeys.Border;
    }
}