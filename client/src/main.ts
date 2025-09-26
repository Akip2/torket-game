import Phaser from "phaser";
import MenuScene from "./scenes/MenuScene";
import { GAME_HEIGHT, GAME_WIDTH, GRAVITY } from "@shared/const";
import GameScene from "./scenes/GameScene";

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
        default: 'matter',
        matter: {
            gravity: { x: 0, y: GRAVITY },
            debug: false
        }
    },

    render: {
        antialias: false,
        roundPixels: true
    },

    scene: [
        GameScene,
        MenuScene,
    ]
};

new Phaser.Game(config);