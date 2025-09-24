export interface BasicBody {
    setVelocity(x: number, y: number): void;
    setVelocityY(y: number): void;
    setVelocityX(x: number): void;

    getVelocity(): { x: number, y: number };
    getPosition(): { x: number, y: number };
}