import { Bodies } from "matter-js";
import GameBody from "./GameBody";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";

export default class BullerServer extends GameBody {
    constructor(x: number, y: number, radius: number) {
        super();

        this.body = Bodies.rectangle(x, y, radius * 2, radius * 2, {
            label: RessourceKeys.Bullet
        });
    }
}