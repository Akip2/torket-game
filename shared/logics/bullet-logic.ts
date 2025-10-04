import { PLAYER_CONST } from "@shared/const";
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

export function generateBulletOriginPosition(playerX: number, playerY: number, targetX: number, targetY: number, playerSize: number = PLAYER_CONST.WIDTH) {
    const bulletVector = new Vector(
        targetX - playerX,
        targetY - playerY
    );

    const normalizedBulletVector = bulletVector.getNormalizedVector();
    const distance = (playerSize / 2) + 10;

    return {
        x: playerX + normalizedBulletVector.x * distance,
        y: playerY + normalizedBulletVector.y * distance
    }
}