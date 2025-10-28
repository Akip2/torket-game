import type { Position } from "@shared/types";

export interface IBasicBody {    
    setVelocity(x: number, y: number): void;
    setVelocityY(y: number): void;
    setVelocityX(x: number): void;

    getVelocity(): Position;
    getPosition(): Position;
}