import type GameScene from "../scenes/GameScene";

export default abstract class UiText extends Phaser.GameObjects.Text {
    relativeX: number;
    relativeY: number;

    constructor(
        scene: GameScene,
        text: string,
        relativeX: number,
        relativeY: number,
        style: Phaser.Types.GameObjects.Text.TextStyle
    ) {
        super(scene, relativeX, relativeY, text, style);
        this.relativeX = relativeX;
        this.relativeY = relativeY;

        scene.add.existing(this);
    }

    update(camera: Phaser.Cameras.Scene2D.Camera) {
        this.x = camera.x + this.relativeX;
        this.y = camera.y + this.relativeY;
    }
}