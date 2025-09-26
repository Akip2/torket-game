import Vector from "../data/Vector";
import type { IBasicBody } from "../interfaces/BasicBody.interface"

export function shoot(bullet: IBasicBody, x: number, y: number, force: number) {
    const bulletPosition = bullet.getPosition();

    const bulletVector = new Vector(
        x - bulletPosition.x,
        y - bulletPosition.y
    );

    const normalizedBulletVector = bulletVector.getNormalizedVector();

    bullet.setVelocity(normalizedBulletVector.x * (force), normalizedBulletVector.y * force);
}