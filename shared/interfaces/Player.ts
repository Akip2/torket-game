export interface Player {
    isOnGround: boolean;
    isMoving: boolean;

    setVelocity(x: number, y: number): void;
    setVelocityY(y: number): void;
    setVelocityX(x: number): void;

    getVelocity(): { x: number, y: number };
    getPosition(): { x: number, y: number };

    moveHorizontally(speed: number, instantly: boolean): void
}