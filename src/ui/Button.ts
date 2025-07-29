import tinycolor from "tinycolor2";

export default class Button extends Phaser.GameObjects.Text {
    constructor(
        scene: Phaser.Scene,
        text: string,
        x: number,
        y: number,
        callback: () => void,
        style: Phaser.Types.GameObjects.Text.TextStyle = {},
        addInstantly: boolean = true
    ) {
        super(scene, x, y, text, style);

        this.setOrigin(0.5);
        this.setAlign('center');
        this.setInteractive({ useHandCursor: true });

        this.on('pointerdown', callback);
        this.on('pointerover', () => this.setStyle({ backgroundColor: tinycolor(style.backgroundColor).lighten(5).desaturate().toHexString() }));
        this.on('pointerout', () => this.setStyle({ backgroundColor: style.backgroundColor }));

        if (addInstantly) {
            scene.add.existing(this);
        }
    }
}
