import type { ExplosionInfo, Position, ShootInfo } from "@shared/types";
import BulletClient from "../game-objects/BulletClient";
import { generateBulletOriginPosition, shoot, simulateShot } from "@shared/logics/bullet-logic";
import type GameScene from "../scenes/GameScene";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import { wait } from "@shared/utils";
import { TIME_STEP, SHOT_CONST } from "@shared/const";
import { Depths } from "@shared/enums/Depths.enum.ts";
import SoundManager from "./SoundManager";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import type PlayerClient from "../game-objects/PlayerClient";
import { Parameter } from "@shared/enums/Parameter.enum";

export default class ShotManager {
    scene: GameScene;

    owner!: PlayerClient;

    force: number = 0;
    isCharging: boolean = false;

    targetPosition: Position = { x: 0, y: 0 };
    startingPosition: Position = { x: 0, y: 0 };

    trajectoryDrawer?: Phaser.GameObjects.Graphics;

    constructor(scene: GameScene) {
        this.scene = scene;
    }

    setOwner(player: PlayerClient) {
        this.owner = player;
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
        if (!this.owner) throw new Error("ShotManager: owner not set");

        this.isCharging = true;

        let sign = 1;
        this.force = SHOT_CONST.MIN_SHOT_FORCE;

        const MAX_FORCE = this.owner.powerManager.getParameterValue(Parameter.Range);

        while (this.isCharging) {
            this.force += (MAX_FORCE / 100) * sign;
            this.drawTrajectory(this.generateShotInfo());

            await wait(TIME_STEP);
            if (this.force <= SHOT_CONST.MIN_SHOT_FORCE || this.force >= MAX_FORCE) {
                sign *= -1;
                await wait(TIME_STEP);
            }
        }
    }

    releaseShot() {
        if (!this.isCharging) return;

        this.isCharging = false;

        this.shootBullet();
    }

    cancelShot() {
        this.isCharging = false;
        this.force = 0;
        this.trajectoryDrawer?.clear();
    }

    shootBulletFromInfo(shotInfo: ShootInfo, explosionInfo: ExplosionInfo) {
        const bullet = new BulletClient(this.scene, shotInfo.originX, shotInfo.originY, explosionInfo);
        shoot(bullet, shotInfo.targetX, shotInfo.targetY, shotInfo.force);
    }

    shootBullet() {
        if (!this.owner.hasBullets()) return;

        this.owner.decreaseBulletCount();

        const shotInfo = this.generateShotInfo();
        const explosionInfo = this.generateExplosionInfo();

        this.shootBulletFromInfo(shotInfo, explosionInfo);
        this.scene.room?.send(RequestTypes.Shoot, shotInfo);
        this.trajectoryDrawer?.clear();

        SoundManager.play(RessourceKeys.Shot);
    }

    drawTrajectory(shootInfo: ShootInfo) {
        if (!this.trajectoryDrawer) {
            this.trajectoryDrawer = this.scene.add.graphics();
            this.scene.worldContainer.add(this.trajectoryDrawer);
            this.scene.worldContainer.sendToBack(this.trajectoryDrawer);
            this.trajectoryDrawer.setDepth(Depths.None);
        }

        this.trajectoryDrawer.clear();
        this.trajectoryDrawer.fillStyle(0xffffff, 0.9);

        simulateShot(
            shootInfo,
            (x: number, y: number) => { this.trajectoryDrawer?.fillCircle(x, y, 2) },
            100
        )
    }

    generateShotInfo() {
        const originPosition = generateBulletOriginPosition(this.startingPosition.x, this.startingPosition.y, this.targetPosition.x, this.targetPosition.y, this.owner.powerManager.getParameterValue(Parameter.Size));

        return {
            targetX: this.targetPosition.x,
            targetY: this.targetPosition.y,
            force: this.force,
            originX: originPosition.x,
            originY: originPosition.y
        }
    }

    generateExplosionInfo(): ExplosionInfo {
        return {
            explosionSize: this.owner.powerManager.getParameterValue(Parameter.ExpSize),
            explosionPushCoef: this.owner.powerManager.getParameterValue(Parameter.ExpPush),
        }
    }
}