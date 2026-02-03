import { BORDERS_CONST } from "@shared/const";
import type { Border } from "@shared/enums/Border.enum";
import type GameScene from "../scenes/GameScene";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";

export default class SimulationBorderClient extends Phaser.GameObjects.Rectangle {
    constructor(scene: GameScene, placement: Border) {
        const { x, y, width, height } = BORDERS_CONST[placement];

        super(scene, x, y, width, height, 0xFF0000);

        scene.add.existing(this);

        scene.matter.add.gameObject(this, {
            isStatic: true
        });

        (this.body as MatterJS.BodyType).label = RessourceKeys.Border;
    }
}