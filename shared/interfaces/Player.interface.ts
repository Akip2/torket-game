import type { IBasicBody } from "./BasicBody.interface";

export interface IPlayer extends IBasicBody {
    isOnGround: boolean;
    isMoving: boolean;

    hp: number;
    isAlive: boolean;

    moveHorizontally(speed: number, instantly: boolean): void
}