import { GAME_HEIGHT, GAME_WIDTH } from "../../../shared/const";
import GameScene from "./GameScene";

export default class TestScene extends GameScene {
    constructor() {
        super("TestScene", GAME_WIDTH / 2, GAME_HEIGHT - GAME_HEIGHT / 3);
    }
}