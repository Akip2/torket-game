import { PLAYER_CONST } from "@shared/const";
import Matter, { Bodies, Body } from "matter-js";
import { InputPayload } from "src/types";
import GameBody from "./GameBody";

export default class PlayerBody extends GameBody {
    constructor(x: number, y: number, size: number = PLAYER_CONST.WIDTH) {
        super();

        this.body = Bodies.rectangle(x, y, size, size, {
            friction: 0,
            frictionAir: 0.05,
            frictionStatic: 0
        });
        Matter.Body.setInertia(this.body, Infinity);
    }

    checkForMovements(inputPayload: InputPayload) {
        if (inputPayload.left) {
            Matter.Body.setVelocity(this.body, {
                x: -PLAYER_CONST.SPEED,
                y: this.body.velocity.y
            });
        } else if (inputPayload.right) {
            Matter.Body.setVelocity(this.body, {
                x: PLAYER_CONST.SPEED,
                y: this.body.velocity.y
            });
        }

        if (inputPayload.up) {
            Matter.Body.setVelocity(this.body, {
                x: this.body.velocity.x,
                y: PLAYER_CONST.JUMP
            });
        }
    }
}