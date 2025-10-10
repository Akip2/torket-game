import { PLAYER_CONST } from "@shared/const";
import Matter, { Bodies, Body } from "matter-js";
import GameBody from "./GameBody";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { IPlayer } from "@shared/interfaces/Player.interface";

export default class PlayerServer extends GameBody implements IPlayer {
    isMoving: boolean;
    isOnGround: boolean;

    hp: number = PLAYER_CONST.MAX_HP;
    isAlive: boolean = true;

    constructor(sessionId: string, x: number, y: number, size: number = PLAYER_CONST.WIDTH) {
        super();

        this.body = Bodies.rectangle(x, y, size, size, {
            friction: 0,
            frictionAir: 0.05,
            frictionStatic: 0,
            label: `${RessourceKeys.Player}:${sessionId}`,
        });
        Matter.Body.setInertia(this.body, Infinity);

        this.isMoving = false;
    }

    moveHorizontally(speed: number): void {
        this.setVelocityX(speed);
    }
}