import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH, GRAVITY } from "@shared/const";
import GameScene from "./scenes/GameScene";
import MapEditionScene from "./scenes/MapEditionScene";
import { SceneNames } from "@shared/enums/SceneNames.enum";
import TitleScreenScene from "./scenes/TitleScreenScene";

const startSceneName = import.meta.env.VITE_START_SCENE;

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: 'game-container',
    backgroundColor: 'rgb(0,14,27)',
    resolution: window.devicePixelRatio,

    scale: {
        mode: Phaser.Scale.NONE,
        resolution: window.devicePixelRatio,
    },

    physics: {
        default: 'matter',
        matter: {
            gravity: { x: 0, y: GRAVITY },
            debug: false
        }
    },

    render: {
        antialias: true,
        roundPixels: false,
        pixelArt: false
    },
};

const game = new Phaser.Game(config);
game.scene.add(SceneNames.TitleScreen, TitleScreenScene);
game.scene.add(SceneNames.Game, GameScene);
game.scene.add(SceneNames.MapEditor, MapEditionScene);

if (startSceneName) {
    game.scene.start(startSceneName);
} else {
    game.scene.start(SceneNames.TitleScreen);
}