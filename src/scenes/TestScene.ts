import { LAST_COLUMN } from "../const";
import GameScene from "./GameScene";

export default class TestScene extends GameScene {
    constructor() {
        super("TestScene");
    }

    addPlayer() {
        return this.placePlayer(4, LAST_COLUMN / 2);
    }

    addStaticPlatforms(staticGroup: Phaser.Physics.Arcade.StaticGroup): void {
        //this.addPlatformBlock(staticGroup, 0, LAST_COLUMN, 0, 3);
    }
}