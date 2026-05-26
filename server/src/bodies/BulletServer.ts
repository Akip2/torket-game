import Matter, { Bodies, Body } from "matter-js";
import GameBody from "./GameBody";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { BULLET_CONST, GRAVITY } from "@shared/const";
import { ExplosionInfo } from "@shared/types";
import { IBulletInterface } from "@shared/interfaces/Bullet.interface";

export default class BulletServer extends GameBody implements IBulletInterface {
    private gravityScale: number;
    private explosionInfo: ExplosionInfo;

    constructor(x: number, y: number, radius: number, explosionInfo: ExplosionInfo, gravityScale: number = BULLET_CONST.GRAVITY_SCALE) {
        const body = Bodies.rectangle(x, y, radius * 2, radius * 2, {
            label: RessourceKeys.Bullet
        });

        super(body);

        this.gravityScale = gravityScale;
        this.explosionInfo = explosionInfo;
    }

    getExplosionInfo() {
        return this.explosionInfo;
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