import { Bodies } from "matter-js";
import GameBody from "./GameBody";

export default class GroundBlock extends GameBody {
    constructor(x: number, y: number, width: number, height: number) {
        super();
        
        this.body = Bodies.rectangle(x, y, width, height, {
            isStatic: true
        });
    }
}