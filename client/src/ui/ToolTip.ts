import { Depths } from "../enums/Depths.enum";
import type GameScene from "../scenes/GameScene";

export default class Tooltip extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Rectangle;
    private label: Phaser.GameObjects.Text;

    constructor(scene: GameScene, x: number, y: number, text: string) {
        super(scene, x, y);

        this.label = scene.add.text(0, 0, text, {
            fontFamily: "Arial",
            fontSize: "13px",
            color: "#cccccc",
        }).setOrigin(0.5);

        const padding = 10;
        const w = this.label.width + padding * 2;
        const h = this.label.height + padding * 2;

        this.bg = scene.add.rectangle(0, 0, w, h, 0x1a1a1a, 0.92);
        this.bg.setStrokeStyle(1, 0x555555);

        this.add([this.bg, this.label]);
        this.setDepth(Depths.First + 1);
        scene.add.existing(this);
    }

    destroy(fromScene?: boolean) {
        super.destroy(fromScene);
    }
}