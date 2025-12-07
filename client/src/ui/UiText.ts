import type GameScene from "../scenes/GameScene";

export default abstract class UiText extends Phaser.GameObjects.Text {
    constructor(
        scene: GameScene,
        text: string,
        x: number,
        y: number,
        style: Phaser.Types.GameObjects.Text.TextStyle
    ) {
        super(scene, x, y, text, style);

        scene.add.existing(this);
    }

    abstract update(...args: any[]): void;
}