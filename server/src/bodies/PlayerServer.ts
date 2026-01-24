import { DAMAGE_BASE, PLAYER_CONST } from "@shared/const";
import Matter, { Bodies, Body } from "matter-js";
import GameBody from "./GameBody";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { IPlayer } from "@shared/interfaces/Player.interface";
import { Player } from "src/rooms/schema/MyRoomState";
import { Position } from "@shared/types";
import { PlayerState } from "@shared/enums/PlayerState.enum";

export default class PlayerServer extends GameBody implements IPlayer {
    isMoving: boolean;
    isOnGround: boolean;
    playerRef: Player;
    sessionId: string;
    onDamage: (hp: number) => void;
    lastProcessedTimeStamp: number = 0;

    constructor(playerRef: Player, sessionId: string, onDamage: (hp: number) => void, size: number = PLAYER_CONST.WIDTH) {
        super();

        this.body = Bodies.rectangle(playerRef.x, playerRef.y, size, size, {
            friction: 0,
            frictionAir: 0.05,
            frictionStatic: 0,
            label: `${RessourceKeys.Player}:${sessionId}`,
        });
        Matter.Body.setInertia(this.body, Infinity);

        this.isMoving = false;
        this.playerRef = playerRef;
        this.onDamage = onDamage;
        this.sessionId = sessionId;
    }

    moveHorizontally(speed: number): void {
        this.setVelocityX(speed);
    }

    applyDamage(directHit: boolean) {
        const damage = Math.round((DAMAGE_BASE) * (directHit ? 2 : 1) + (Math.random() * 15));

        this.playerRef.hp -= damage;

        if (this.playerRef.hp <= 0) {
            this.playerRef.hp = 0;
            this.playerRef.isAlive = false;
        }

        this.onDamage(this.playerRef.hp);
    }

    getState() {
        return this.playerRef.state;
    }

    setState(state: PlayerState) {
        this.playerRef.state = state;
    }

    getInputQueue() {
        return this.playerRef.inputQueue;
    }

    updatePlayerRefMouse(mousePosition: Position) {
        this.playerRef.mouseX = mousePosition.x;
        this.playerRef.mouseY = mousePosition.y;
    }

    updatePlayerRefPosition() {
        this.playerRef.timeStamp = this.lastProcessedTimeStamp;
        this.playerRef.x = this.getX();
        this.playerRef.y = this.getY();
    }
}