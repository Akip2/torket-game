import { GAME_HEIGHT } from "../const";
import { HorizontalEnum } from "../enums/horizontal.enum";
import { VerticalEnum } from "../enums/vertical.enum";
import { generateHorizontalValue, generateVerticalValue } from "../utils";
import GameScene from "./GameScene";

export default class TestScene extends GameScene {
    constructor() {
        super("TestScene");
    }

    addPlayer() {
        return this.physics.add.sprite(generateHorizontalValue(0, HorizontalEnum.CENTER), GAME_HEIGHT - 80, 'player');
    }

    addStaticPlatforms(staticGroup: Phaser.Physics.Arcade.StaticGroup): void {
        staticGroup.create(generateHorizontalValue(400, HorizontalEnum.CENTER), generateVerticalValue(32, VerticalEnum.DOWN), 'ground');
    }
}