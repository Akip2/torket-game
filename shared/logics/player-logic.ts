import { PlayerState } from "@shared/enums/PlayerState.enum";
import { PLAYER_CONST } from "../const";
import Vector from "../data/Vector";
import type { IPlayer } from "../interfaces/Player.interface";
import type { InputPayload } from "../types";

export function movePlayerFromInputs(player: IPlayer, inputPayload: InputPayload, instantly: boolean = false) {
    if (!canPlayerMove(player)) return;
    
    if (inputPayload.right || inputPayload.left) {
        player.isMoving = true;

        if (inputPayload.left) { //Left
            player.moveHorizontally(-PLAYER_CONST.SPEED, instantly);
        } else { //Right
            player.moveHorizontally(PLAYER_CONST.SPEED, instantly);
        }
    } else if (player.isMoving) {
        player.isMoving = false;
        player.setVelocityX(0);
    }

    if (inputPayload.up && canPlayerJump(player) && !instantly) {
        player.isOnGround = false;
        player.setVelocityY(PLAYER_CONST.JUMP);
    }
}

export function canPlayerMove(player: IPlayer) {
    return player.getState() === PlayerState.Moving;
}

export function canPlayerShoot(player: IPlayer) {
    return player.getState() === PlayerState.Shooting;
}

export function canPlayerJump(player: IPlayer) {
    return Math.abs(player.getVelocity().y) < 0.1 && player.isOnGround;
}

export function isPlayerInRadius(player: IPlayer, cx: number, cy: number, radius: number) {
    return getPlayerDistanceFromPoint(player, cx, cy) <= radius * 0.9;
}

export function playerReactToExplosion(player: IPlayer, cx: number, cy: number, radius: number) {
    if (isPlayerInRadius(player, cx, cy, radius)) {
        pushPlayer(player, cx, cy, radius);
    }
}

export function getPlayerDistanceFromPoint(player: IPlayer, cx: number, cy: number) {
    const playerPosition = player.getPosition();

    const closestX = Math.max(playerPosition.x - PLAYER_CONST.WIDTH / 2, Math.min(cx, playerPosition.x + PLAYER_CONST.WIDTH / 2));
    const closestY = Math.max(playerPosition.y - PLAYER_CONST.WIDTH / 2, Math.min(cy, playerPosition.y + PLAYER_CONST.WIDTH / 2));
    const distVect = new Vector(closestX - cx, closestY - cy);

    return distVect.getNorm();
}

export function pushPlayer(player: IPlayer, cx: number, cy: number, radius: number) {
    const dist = getPlayerDistanceFromPoint(player, cx, cy);

    if (dist < radius) {
        const playerPosition = player.getPosition();
        const normalizedPushVector = new Vector(playerPosition.x - cx, playerPosition.y - cy).getNormalizedVector();
        const force = (1 - dist / radius) * 10;

        player.setVelocity(normalizedPushVector.x * force, normalizedPushVector.y * force);
    }
}