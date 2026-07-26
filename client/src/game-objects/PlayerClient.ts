import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import type { IPlayer } from "@shared/interfaces/Player.interface";
import type GameScene from "../scenes/GameScene";
import Gun from "./Gun";
import { CLIENT_PREDICTION, FREE_ROAM, PLAYER_CONST } from "@shared/const";
import { BarStyle, TextStyle } from "../ui/ui-styles";
import type { Position } from "@shared/types";
import { Depths } from "@shared/enums/Depths.enum.ts";
import NameTag from "../ui/NameTag";
import { PlayerState } from "@shared/enums/PlayerState.enum";
import SoundManager from "../managers/SoundManager";
import HealthBar from "../ui/bars/HealthBar";
import Bar from "../ui/bars/Bar";
import PowerManager from "@shared/data/power/PowerManager";
import { Parameter } from "@shared/enums/Parameter.enum";
import PlayerFace from "../ui/PlayerFace";
import { FaceExpression } from "@shared/enums/FaceExpression.enum";
import BulletReserve from "../ui/BulletReserve";

export default class PlayerClient extends Phaser.Physics.Matter.Sprite implements IPlayer {
    state: PlayerState = PlayerState.Inactive;

    isMoving: boolean;
    isOnGround: boolean;

    maxHp: number;
    hp: number;
    isAlive: boolean;

    gun: Gun;
    healthBar: HealthBar;
    bulletReserve: BulletReserve;
    movementBar: Bar;
    nameTag: NameTag;
    face: PlayerFace;

    maxMovement: number;
    movementLeft: number;

    jumpCostCoef: number;
    jumpKeyPressed: boolean;

    maxBulletCount: number;
    bulletCount: number;

    powerManager: PowerManager;

    generateDeathParticles: (x: number, y: number) => void;

    constructor(scene: GameScene, name: string, x: number, y: number, self: boolean = true) {
        super(scene.matter.world, x, y, self ? RessourceKeys.Player : RessourceKeys.PlayerEnnemy);

        scene.worldContainer.add(this);
        (this.body as MatterJS.BodyType).label = RessourceKeys.Player;
        this.setDepth(Depths.PlayerUi)
        this.setFixedRotation();

        if (CLIENT_PREDICTION) {
            this.setFriction(0, 0.05, 0)
        } else { // disable physics
            this.setIgnoreGravity(true);
            this.setStatic(true);
            this.setFriction(0, 0, 0);
            (this.body as MatterJS.BodyType).isSensor = true;
        }

        this.powerManager = new PowerManager();

        this.isMoving = false;
        this.isOnGround = false;
        this.isAlive = true;

        this.maxHp = PLAYER_CONST.BASE_MAX_HP;
        this.hp = this.maxHp;

        this.jumpCostCoef = 1;
        this.jumpKeyPressed = false;

        this.maxBulletCount = PLAYER_CONST.BASE_MAX_BULLET_COUNT;
        this.bulletCount = 0;

        this.maxMovement = PLAYER_CONST.BASE_MAX_MOVEMENT;
        this.movementLeft = this.maxMovement;

        this.gun = new Gun(scene, x, y);
        this.gun.setVisible(false);
        this.healthBar = new HealthBar(scene, this.x, this.y, 1, BarStyle.Health);
        this.movementBar = new Bar(scene, this.x, this.y, 1, BarStyle.Movement);
        this.movementBar.hide();
        this.nameTag = new NameTag(scene, name, x, y, TextStyle.NameTag);
        this.face = new PlayerFace(scene, x, y, TextStyle.PlayerFace);
        this.bulletReserve = new BulletReserve(scene, x, y);

        this.generateDeathParticles = (x: number, y: number) => {
            const emmiter = scene.add.particles(x, y, RessourceKeys.DeathParticle, {
                lifespan: 500,
                speed: { min: 80, max: 700 },
                angle: { min: 0, max: 360 },
                scale: { start: 1.125, end: 0 },
                quantity: 500,
                gravityY: 50,
                blendMode: 'ADD',
                emitting: false
            }).setDepth(Depths.Player);

            emmiter.explode(50);
        }
    }
    
    setBulletCount(bulletCount: number) {
        if ((bulletCount === this.bulletCount) || (bulletCount > this.maxBulletCount) || (bulletCount < 0)) return;

        this.bulletCount = bulletCount;
        this.bulletReserve.updateBulletCount(bulletCount);
    }

    hasBullets(): boolean {
        return this.bulletCount > 0;
    }

    decreaseBulletCount(): void {
        this.setBulletCount(this.bulletCount - 1);
    }

    reload(): void {
        this.setBulletCount(this.bulletCount + 1);
    }

    setJumpKeyPressed(pressed: boolean): void {
        this.jumpKeyPressed = pressed;
    }

    isJumpKeyPressed(): boolean {
        return this.jumpKeyPressed;
    }

    increaseJumpCost() {
        this.jumpCostCoef += 1;
    }

    resetJumpCost(): void {
        this.jumpCostCoef = 1;
    }

    getJumpCost(): number {
        return PLAYER_CONST.BASE_JUMP_COST * this.jumpCostCoef;
    }

    addForceX(x: number): void {
        this.applyForce(new Phaser.Math.Vector2(x, 0));
    }

    addForceY(y: number): void {
        this.applyForce(new Phaser.Math.Vector2(0, y));
    }

    addForce(x: number, y: number): void {
        this.applyForce(new Phaser.Math.Vector2(x=x, y=y));
    }

    addPower(powerName: string) {
        this.powerManager.addPowerFromName(powerName);
        this.updateFromNewParameters();
    }

    updateFromNewParameters(): void {
        // UPDATING HP
        const newMaxHp = this.powerManager.getParameterValue(Parameter.Hp);
        this.hp *= newMaxHp / this.maxHp;
        this.maxHp = newMaxHp;

        // UPDATING MOVEMENT
        const newMaxMovement = this.powerManager.getParameterValue(Parameter.Movement);
        this.movementLeft *= newMaxMovement / this.maxMovement;
        this.maxMovement = newMaxMovement;

        // UPDATING SIZE
        const spriteScale = this.powerManager.getParameterValue(Parameter.Size) / PLAYER_CONST.BASE_WIDTH;
        this.setScale(spriteScale);
        this.gun.setScale(spriteScale);
        this.updateUiMargins();

        // UPDATING WEIGHT
        this.setMass(this.powerManager.getParameterValue(Parameter.Weight));
    }

    private updateUiMargins() {
        const marginOffsetY = (PLAYER_CONST.BASE_WIDTH - this.powerManager.getParameterValue(Parameter.Size)) / 2;
        this.healthBar.setMarginOffsetY(marginOffsetY);
        this.movementBar.setMarginOffsetY(marginOffsetY);
        this.nameTag.setMarginOffsetY(marginOffsetY);
    }

    getState(): PlayerState {
        return this.state;
    }

    updateGunPlacement(targetPosition: Position) {
        if (!this.isAlive || (this.state !== PlayerState.Shooting && !FREE_ROAM)) {
            this.gun.setVisible(false);
            return;
        }

        this.gun.setVisible(true);
        const dx = targetPosition.x - this.x;
        const dy = targetPosition.y - this.y;
        this.gun.updateDisplay(this.x, this.y, dx, dy);
    }

    updateUI() {
        this.healthBar.updateGraphics(this.x, this.y, this.hp / this.maxHp);
        this.movementBar.updateGraphics(this.x, this.y, this.movementLeft / this.maxMovement);
        this.nameTag.updatePlacement(this.x, this.y);
        this.face.updatePlacement(this.x, this.y);
        this.bulletReserve.updatePlacement(this.x, this.y);
    }

    setDead() {
        if (!this.isAlive) {
            return;
        }

        this.isAlive = false;
        SoundManager.play(RessourceKeys.Death);

        this.destroyComponents();
        this.setVisible(false);

        this.generateDeathParticles(this.x, this.y);
    }

    getPosition(): Position {
        return { x: this.x, y: this.y };
    }

    moveHorizontally(speed: number, instantly: boolean = false) {
        if (instantly) {
            if (!this.collides(this.x + speed, this.y)) {
                this.setPosition(this.x + speed, this.y);
            }
        } else {
            this.setVelocityX(speed);
        }
    }

    collides(x: number, y: number) {
        const allBodies = (this.scene.matter.world as any).localWorld.bodies;

        const playerBounds = {
            min: {
                x: x - this.width / 2,
                y: y - this.height / 2 + 1
            },
            max: {
                x: x + this.width / 2,
                y: this.y + this.height / 2 - 1
            }
        };

        for (const body of allBodies) {
            if (body === this.body || body.label !== RessourceKeys.Ground) {
                continue;
            }

            if (!(
                playerBounds.max.x < body.bounds.min.x ||
                playerBounds.min.x > body.bounds.max.x ||
                playerBounds.max.y < body.bounds.min.y ||
                playerBounds.min.y > body.bounds.max.y
            )) {
                return true;
            }
        }

        return false;
    }

    getName() {
        return this.nameTag.text;
    }

    destroy(fromScene?: boolean): void {
        this.destroyComponents(fromScene);
        super.destroy(fromScene);
    }

    destroyComponents(fromScene?: boolean) {
        this.gun.destroy(fromScene);
        this.healthBar.destroy(fromScene);
        this.movementBar.destroy(fromScene);
        this.nameTag.destroy(fromScene);
        this.face.destroy(fromScene);
        this.bulletReserve.destroy(fromScene);
    }

    setPlayerState(state: PlayerState) {
        this.state = state;

        if (state === PlayerState.Shooting) SoundManager.play(RessourceKeys.Reloading);
    }

    hasMovementLeft(): boolean {
        return this.movementLeft > 0;
    }

    stopHorizontalMovement(): void {
        this.setVelocityX(0);
    }

    decreaseMovementLeft(amount: number): void {
        this.movementLeft = Math.max(0, this.movementLeft - amount);

        if (!this.hasMovementLeft() && this.isOnGround) {
            this.stopHorizontalMovement();
        }
    }

    fillMovementLeft() {
        this.movementLeft = this.maxMovement;
    }

    damageCallback() {
        this.face.changeFace(FaceExpression.Unpleased, 500);
    }
}