import Phaser from "phaser";
import MenuScene from "./scenes/MenuScene";
import TestScene from "./scenes/TestScene";
import { GAME_HEIGHT, GAME_WIDTH } from "./const";

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: 'rgb(0,14,27)',
    resolution: window.devicePixelRatio,

    scale: {
        mode: Phaser.Scale.NONE,
    },

    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 800 },
            debug: false
        }
    },

    scene: [
        TestScene,
        MenuScene,
    ]
};

new Phaser.Game(config);