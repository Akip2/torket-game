import type { Position } from "../types";

export interface IBasicBody {    
    setVelocity(x: number, y: number): void;
    setVelocityY(y: number): void;
    setVelocityX(x: number): void;

    getVelocity(): Position;
    getPosition(): Position;
}