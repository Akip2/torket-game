import type { ShootInfo } from "@shared/types";
import { BULLET_CONST, GRAVITY, PLAYER_CONST, TIME_STEP } from "../const";
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

export function generateBulletOriginPosition(playerX: number, playerY: number, targetX: number, targetY: number, playerSize: number = PLAYER_CONST.BASE_WIDTH) {
    const bulletVector = new Vector(
        targetX - playerX,
        targetY - playerY
    );

    const normalizedBulletVector = bulletVector.getNormalizedVector();
    const distance = (playerSize / 2) + 25;

    return {
        x: playerX + normalizedBulletVector.x * distance,
        y: playerY + normalizedBulletVector.y * distance
    }
}

export function simulateShot(shootInfo: ShootInfo, onStep: (x: number, y: number) => void, steps: number = 100) {
    const gravityStep = GRAVITY * 0.001 * TIME_STEP * TIME_STEP * BULLET_CONST.GRAVITY_SCALE;
    const frictionFactor = 1 - BULLET_CONST.AIR_FRICTION;

    let x = shootInfo.originX;
    let y = shootInfo.originY;

    const normalizedVector = new Vector(
        shootInfo.targetX - x,
        shootInfo.targetY - y
    ).getNormalizedVector();

    let vx = normalizedVector.x * shootInfo.force;
    let vy = normalizedVector.y * shootInfo.force;

    for (let i = 0; i < steps; i++) {
        vx = vx * frictionFactor;
        x += vx;
        y += vy;

        vy = vy * frictionFactor + gravityStep;

        onStep(x, y);
    }
}