import type { PlayerState } from "../enums/PlayerState.enum";
import type { IBasicBody } from "./BasicBody.interface";

export interface IPlayer extends IBasicBody {
    isOnGround: boolean;
    isMoving: boolean;

    moveHorizontally(speed: number, instantly: boolean): void

    getState(): PlayerState;
    hasMovementLeft(): boolean;
    decreaseMovementLeft(amount: number): void;
}