import { PLAYER_CONST, SHOT_CONST } from "@shared/const";
import { Bodies, Body } from "matter-js";
import GameBody from "./GameBody";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { IPlayer } from "@shared/interfaces/Player.interface";
import { Player } from "../rooms/schema/MyRoomState";
import { Position } from "@shared/types";
import { PlayerState } from "@shared/enums/PlayerState.enum";
import PowerManager from "@shared/data/power/PowerManager";
import { Parameter } from "@shared/enums/Parameter.enum";

export default class PlayerServer extends GameBody implements IPlayer {
    isMoving: boolean = false;
    isOnGround: boolean = false;
    playerRef: Player;
    sessionId: string;
    onDamage: (hp: number, damage?: number, directHit?: boolean) => void;
    lastProcessedTimeStamp: number = 0;
    powerManager: PowerManager;

    maxHp: number;
    maxMovement: number;

    currentScale: number;

    constructor(playerRef: Player, sessionId: string, onDamage: (hp: number, damage?: number, directHit?: boolean) => void, size: number = PLAYER_CONST.BASE_WIDTH) {
        const body = Bodies.rectangle(playerRef.x, playerRef.y, size, size, {
            friction: 0,
            frictionAir: 0.05,
            frictionStatic: 0,
            slop: 0,
            label: `${RessourceKeys.Player}:${sessionId}`,
        });
        Body.setMass(body, PLAYER_CONST.BASE_MASS);
        Body.setInertia(body, Infinity);

        super(body);

        this.playerRef = playerRef;
        this.onDamage = onDamage;
        this.sessionId = sessionId;
        this.powerManager = new PowerManager();

        this.maxHp = PLAYER_CONST.BASE_MAX_HP;
        this.maxMovement = PLAYER_CONST.BASE_MAX_MOVEMENT;

        this.currentScale = 1;
    }

    hasMovementLeft(): boolean {
        return this.playerRef.movementLeft > 0;
    }

    decreaseMovementLeft(amount: number): void {
        this.playerRef.movementLeft -= amount;

        if (!this.hasMovementLeft()) {
            //this.setVelocityX(0);
            this.isMoving = false;
        }
    }

    fillMovementLeft() {
        this.playerRef.movementLeft = this.maxMovement;
    }

    moveHorizontally(speed: number): void {
        if (Math.abs(this.body.velocity.x) < Math.abs(speed)) {
            Body.applyForce(this.body, this.body.position, {
                x: speed/1200 * this.body.mass,
                y: 0
            });
        }
    }

    enableMass() {
        Body.setMass(this.body, this.powerManager.getParameterValue(Parameter.Weight));
    }

    disableMass() {
        Body.setMass(this.body, 1);
    }

    applyDamage(damage: number, directHit: boolean) {
        const actualDamage = Math.round(damage * (directHit ? 1.5 : 1) + (Math.random() * 5));

        this.playerRef.hp -= actualDamage;

        if (this.playerRef.hp <= 0) {
            this.die();
        }

        this.onDamage(this.playerRef.hp, actualDamage, directHit);
    }

    instantDeath() {
        this.die();
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

    die() {
        this.playerRef.hp = 0;
        this.playerRef.isAlive = false;

        this.removeFromWorld();
    }

    isAlive() {
        return this.playerRef.isAlive;
    }

    addPower(powerName: string): void {
        this.powerManager.addPowerFromName(powerName);
        this.updateFromNewParameters();
    }

    updateFromNewParameters(): void {
        // UPDATING HP
        const newMaxHp = this.powerManager.getParameterValue(Parameter.Hp);
        this.playerRef.hp *= newMaxHp / this.maxHp;
        this.maxHp = newMaxHp;

        // UPDATING MOVEMENT
        const newMaxMovement = this.powerManager.getParameterValue(Parameter.Movement);
        this.maxMovement = newMaxMovement;

        // UPDATING SIZE
        const targetScale = this.powerManager.getParameterValue(Parameter.Size) / PLAYER_CONST.BASE_WIDTH;
        const relativeScale = targetScale / this.currentScale;
        Body.scale(this.body, relativeScale, relativeScale);
        this.currentScale = targetScale;
        Body.setInertia(this.body, Infinity);

        // UPDATING WEIGHT
        Body.setMass(this.body, this.powerManager.getParameterValue(Parameter.Weight));
    }
}