import Matter, { Bodies, Body } from "matter-js";
import GameBody from "./GameBody";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { BULLET_CONST, GRAVITY } from "@shared/const";

export default class BullerServer extends GameBody {
    private gravityScale: number;

    constructor(x: number, y: number, radius: number, gravityScale: number = BULLET_CONST.GRAVITY_SCALE) {
        super();

        this.body = Bodies.rectangle(x, y, radius * 2, radius * 2, {
            label: RessourceKeys.Bullet
        });

        this.gravityScale = gravityScale;
    }

    nullifyBaseGravity() {
        const antiForce =
            this.body.mass *
            GRAVITY *
            0.001;

        Body.applyForce(this.body, this.body.position, {
            x: 0,
            y: -antiForce
        });
    }

    applyCustomGravity() {
        const gravityForce =
            this.body.mass *
            GRAVITY *
            this.gravityScale
            * 0.001;

        Body.applyForce(this.body, this.body.position, {
            x: 0,
            y: gravityForce
        });
    }
}