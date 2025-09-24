import Vector from "../data/Vector";
import type { BasicBody } from "../interfaces/BasicBody"

export function shoot(bullet: BasicBody, x: number, y: number, force: number) {
    const bulletPosition = bullet.getPosition();

    const bulletVector = new Vector(
        x - bulletPosition.x,
        y - bulletPosition.y
    );

    const normalizedBulletVector = bulletVector.getNormalizedVector();

    bullet.setVelocity(normalizedBulletVector.x * (force), normalizedBulletVector.y * force);
}