import { HorizontalEnum } from "../enums/horizontal.enum";
import { VerticalEnum } from "../enums/vertical.enum";
import { generateHorizontalValue, generateVerticalValue } from "../utils";
import GameScene from "./GameScene";

export default class TestScene extends GameScene {
    constructor() {
        super("TestScene");
    }

    preload() {
        this.load.image('ground', 'assets/platform.png');
    }

    create() {
        const staticGroup = this.physics.add.staticGroup();
        staticGroup.create(generateHorizontalValue(400, HorizontalEnum.CENTER), generateVerticalValue(32, VerticalEnum.DOWN), 'ground');
    }
}