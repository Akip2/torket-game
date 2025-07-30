import Phaser from "phaser";
import MenuScene from "./scenes/MenuScene";
import TestScene from "./scenes/TestScene";

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

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 300 },
            debug: false
        }
    },

    scene: [
        TestScene,
        MenuScene,
    ]
};

new Phaser.Game(config);