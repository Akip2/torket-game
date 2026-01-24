import type { PlayerState } from "@shared/enums/PlayerState.enum";
import type { IBasicBody } from "./BasicBody.interface";

export interface IPlayer extends IBasicBody {
    isOnGround: boolean;
    isMoving: boolean;

    moveHorizontally(speed: number, instantly: boolean): void
    getState(): PlayerState;
}