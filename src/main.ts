import Phaser from "phaser";
import MenuScene from "./scenes/MenuScene";

const config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 800,
    parent: 'game-container',
    backgroundColor: '#028af8',
    resolution: window.devicePixelRatio,

    scale: {
        mode: Phaser.Scale.NONE,
    },

    scene: [MenuScene]
};

new Phaser.Game(config);