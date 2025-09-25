import { PLAYER_CONST } from "../const";
import Vector from "../data/Vector";
import type { IPlayer } from "../interfaces/Player.interface";
import type { InputPayload } from "../types";

export function movePlayerFromInputs(player: IPlayer, inputPayload: InputPayload, instantly: boolean = false) {
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

    if (inputPayload.up && canPlayerJump(player)) {
        player.isOnGround = false;
        player.setVelocityY(PLAYER_CONST.JUMP);
    }
}

export function canPlayerJump(player: IPlayer) {
    return Math.abs(player.getVelocity().y) < 0.1 && player.isOnGround;
}

export function pushPlayer(player: IPlayer, cx: number, cy: number, radius: number) {
    const playerPosition = player.getPosition();
    const pushVector = new Vector(playerPosition.x - cx, playerPosition.y - cy);
    const dist = pushVector.getNorm();

    if (dist < radius) {
        let normalizedPushVector: Vector;

        if (dist === 0) {
            const angle = Math.random() * Math.PI * 2;
            normalizedPushVector = new Vector(Math.cos(angle), Math.sin(angle));
        } else {
            normalizedPushVector = pushVector.getNormalizedVector();
        }
        const force = (1 - dist / radius) * (10 + radius / 2.5);

        player.setVelocity(normalizedPushVector.x * force, normalizedPushVector.y * force);
    }
}