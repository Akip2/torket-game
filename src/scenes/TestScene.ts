import { GAME_HEIGHT, GAME_WIDTH, LAST_COLUMN } from "../const";
import GameScene from "./GameScene";

export default class TestScene extends GameScene {
    constructor() {
        super("TestScene");
    }

    addPlayer() {
        return this.placePlayer(GAME_WIDTH / 2, GAME_HEIGHT - GAME_HEIGHT / 3);
    }

    addStaticPlatforms(staticGroup: Phaser.Physics.Arcade.StaticGroup): void {
        //this.addPlatformBlock(staticGroup, 0, LAST_COLUMN, 0, 3);
    }
}