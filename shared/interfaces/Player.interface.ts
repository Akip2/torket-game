import PowerManager from "../data/power/PowerManager";
import type { PlayerState } from "../enums/PlayerState.enum";
import type { IBasicBody } from "./BasicBody.interface";

export interface IPlayer extends IBasicBody {
    isOnGround: boolean;
    isMoving: boolean;
    powerManager: PowerManager;

    moveHorizontally(speed: number, instantly: boolean): void

    getState(): PlayerState;
    hasMovementLeft(): boolean;
    decreaseMovementLeft(amount: number): void;

    resetJumpCost(): void;
    increaseJumpCost(): void;
    getJumpCost(): number;

    isJumpKeyPressed(): boolean;
    setJumpKeyPressed(pressed: boolean): void;

    updateFromNewParameters(): void;
    addPower(powerName: string): void;

    hasBullets(): boolean;
    decreaseBulletCount(): void;
    hasMaxBulletCount(): boolean;
    reload(): void;

    addForce(x: number, y: number): void;
    addForceX(x: number): void;
    addForceY(y: number): void;
}