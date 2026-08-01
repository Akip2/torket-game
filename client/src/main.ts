import Phaser from "phaser";
import { GRAVITY, HUD_HEIGHT } from "@shared/const";
import GameScene from "./scenes/GameScene";
import MapEditionScene from "./scenes/MapEditionScene";
import { SceneNames } from "@shared/enums/SceneNames.enum";
import TitleScreenScene from "./scenes/TitleScreenScene";

const startSceneName = import.meta.env.VITE_START_SCENE;

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight - HUD_HEIGHT,
    parent: 'game-container',
    backgroundColor: 'rgb(0,14,27)',
    resolution: window.devicePixelRatio,

    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth,
        height: window.innerHeight - HUD_HEIGHT,
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
        roundPixels: true,
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