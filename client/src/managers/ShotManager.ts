import type { Position, ShootInfo } from "@shared/types";
import BulletClient from "../game-objects/BulletClient";
import { generateBulletOriginPosition, shoot } from "@shared/logics/bullet-logic";
import type GameScene from "../scenes/GameScene";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import { wait } from "@shared/utils";
import { BASE_MAX_SHOT_FORCE, BULLER_CONST, GAME_HEIGHT, GAME_WIDTH, GRAVITY, MIN_SHOT_FORCE, TIME_STEP } from "@shared/const";
import Vector from "@shared/data/Vector";
import { Depths } from "@shared/enums/Depths.eunum";

export default class ShotManager {
    scene: GameScene;

    force: number = 0;
    isCharging: boolean = false;

    targetPosition: Position = { x: 0, y: 0 };
    startingPosition: Position = { x: 0, y: 0 };

    trajectoryDrawer?: Phaser.GameObjects.Graphics;

    constructor(scene: GameScene) {
        this.scene = scene;
    }

    setTargetPosition(x: number, y: number) {
        this.targetPosition = {
            x: x,
            y: y
        };
    }

    setStartingPosition(x: number, y: number) {
        this.startingPosition = {
            x: x,
            y: y
        };
    }

    async chargeShot() {
        this.isCharging = true;

        let sign = 1;
        this.force = MIN_SHOT_FORCE;

        while (this.isCharging) {
            this.force += 0.33 * sign;
            this.drawTrajectory(this.generateShotInfo());

            await wait(TIME_STEP);
            if (this.force <= MIN_SHOT_FORCE || this.force >= BASE_MAX_SHOT_FORCE) {
                sign *= -1;
                await wait(TIME_STEP);
            }

        }
    }

    releaseShot() {
        this.isCharging = false;

        this.shootBullet();
    }

    shootBulletFromInfo(shotInfo: ShootInfo) {
        const bullet = new BulletClient(this.scene, shotInfo.originX, shotInfo.originY);
        shoot(bullet, shotInfo.targetX, shotInfo.targetY, shotInfo.force);
    }

    shootBullet() {
        const shotInfo = this.generateShotInfo();

        this.shootBulletFromInfo(shotInfo);
        this.scene.room.send(RequestTypes.Shoot, shotInfo);
        this.trajectoryDrawer?.clear();
    }

    drawTrajectory(shootInfo: ShootInfo) {
        if (!this.trajectoryDrawer) {
            this.trajectoryDrawer = this.scene.add.graphics();
        }
        this.trajectoryDrawer.clear();
        //this.trajectoryDrawer = this.scene.add.graphics();
        this.trajectoryDrawer.fillStyle(0xffffff, 0.9);

        const gravityStep = GRAVITY * 0.001 * TIME_STEP * TIME_STEP;
        const frictionFactor = 1 - BULLER_CONST.AIR_FRICTION;

        let x = shootInfo.originX;
        let y = shootInfo.originY;

        const normalizedVector = new Vector(
            shootInfo.targetX - x,
            shootInfo.targetY - y
        ).getNormalizedVector();

        let vx = normalizedVector.x * shootInfo.force;
        let vy = normalizedVector.y * shootInfo.force;

        const maxSteps = 100;
        for (let i = 0; i < maxSteps; i++) {
            vx = vx * frictionFactor;
            vy = vy * frictionFactor + gravityStep;

            x += vx;
            y += vy;

            if (x < -100 || x > GAME_WIDTH + 100 || y > GAME_HEIGHT + 100) break;

            this.trajectoryDrawer.fillCircle(x, y, 2);
        }

        this.trajectoryDrawer.setDepth(Depths.None);
    }

    generateShotInfo() {
        const originPosition = generateBulletOriginPosition(this.startingPosition.x, this.startingPosition.y, this.targetPosition.x, this.targetPosition?.y);

        return {
            targetX: this.targetPosition.x,
            targetY: this.targetPosition.y,
            force: this.force,
            originX: originPosition.x,
            originY: originPosition.y
        }
    }
}