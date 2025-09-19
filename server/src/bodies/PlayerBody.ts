import { PLAYER_CONST } from "@shared/const";
import Matter, { Bodies, Body } from "matter-js";
import { InputPayload } from "@shared/types";
import GameBody from "./GameBody";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";

export default class PlayerBody extends GameBody {
    isMoving: boolean;
    isOnGround: boolean;

    constructor(sessionId: string, x: number, y: number, size: number = PLAYER_CONST.WIDTH) {
        super();

        this.body = Bodies.rectangle(x, y, size, size, {
            friction: 0,
            frictionAir: 0.05,
            frictionStatic: 0,
            label: `${RessourceKeys.Player}:${sessionId}`
        });
        Matter.Body.setInertia(this.body, Infinity);

        this.isMoving = false;
    }

    canJump() {
        return Math.abs(this.body.velocity.y) < 0.1 && this.isOnGround;
    }

    checkForMovements(inputPayload: InputPayload) {
        if (inputPayload.left || inputPayload.right) {
            this.isMoving = true;

            if (inputPayload.left) {
                this.setPosition(this.getX() - PLAYER_CONST.SPEED, this.getY());
                //this.setVelocity(-PLAYER_CONST.SPEED, this.body.velocity.y);
            } else {
                this.setPosition(this.getX() + PLAYER_CONST.SPEED, this.getY());
                //this.setVelocity(PLAYER_CONST.SPEED, this.body.velocity.y);
            }
        } else if (this.isMoving) {
            this.isMoving = false;
            this.setVelocity(0, this.body.velocity.y);
        }

        if (inputPayload.up && this.canJump()) {
            this.isOnGround = false;
            this.setVelocity(this.body.velocity.x, PLAYER_CONST.JUMP);
        }
    }
}