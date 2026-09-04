import { BULLET_CONST, EXPLOSION_CONST, PLAYER_CONST, SHOT_CONST } from "@shared/const";
import { generateBulletOriginPosition, simulateShot } from "@shared/logics/bullet-logic";
import { CalculatedTrajectory, Position, ShootInfo } from "@shared/types";
import QuadBlock from "@shared/data/QuadBlock";
import { HitType } from "../enums/HitType.enum";

const ANGLE_RANGE = Math.PI / 4;      // 45°
const ANGLE_STEP = (Math.PI / 180);    // 5°

const FORCE_STEP = 1;
export default class TrajectoryCalculator {
    private currentTrajectory!: CalculatedTrajectory;

    private playerPositionInRadius(x: number, y: number, playerPos: Position, radius: number) {
        const dist = Math.sqrt(
            (x - playerPos.x) ** 2
            +
            (y - playerPos.y) ** 2
        );

        return dist < radius + (PLAYER_CONST.BASE_WIDTH / 2);
    }

    private shotStepCallback(x: number, y: number, playerPos: Position, terrain: QuadBlock, bulletCount: number) {
        if (this.playerPositionInRadius(x, y, playerPos, BULLET_CONST.RADIUS)) { // direct hhit
            this.currentTrajectory.hitType = HitType.Direct;
            this.currentTrajectory.useful = true;
        }

        if (terrain.collidesWithCircle(x, y, BULLET_CONST.RADIUS)) {
            this.currentTrajectory.collisionNumber += 1;

            if (this.currentTrajectory.hitType === HitType.None && this.playerPositionInRadius(x, y, playerPos, EXPLOSION_CONST.BASE_RADIUS)) {
                this.currentTrajectory.hitType = HitType.Explosion;
                this.currentTrajectory.useful = true;
            }
        }

        const endCondition = this.currentTrajectory.hitType === HitType.Direct || (this.currentTrajectory.collisionNumber >= bulletCount);
        return endCondition;
    }

    private resetCurrentTrajectory(shootInfo: ShootInfo) {
        this.currentTrajectory = this.generateBaseTrajectory(shootInfo);
    }

    private generateBaseTrajectory(shootInfo?: ShootInfo): CalculatedTrajectory {
        return {
            shootInfo: shootInfo ?? {
                originX: 0,
                originY: 0,
                force: 0,
                targetX: 0,
                targetY: 0
            },
            collisionNumber: 0,
            hitType: HitType.None,
            useful: false,
        }
    }

    private iterateThroughTrajectories(
        startPos: Position,
        targetPos: Position,
        terrain: QuadBlock,
        bulletCount: number,
        stopCondition: (trajectory: CalculatedTrajectory) => boolean = () => false
    ) {
        const dx = targetPos.x - startPos.x;
        const dy = targetPos.y - startPos.y;

        const baseAngle = Math.atan2(dy, dx);

        let bestTrajectory = this.generateBaseTrajectory();
        for (
            let currentAngle = baseAngle - ANGLE_RANGE;
            currentAngle <= baseAngle + ANGLE_RANGE;
            currentAngle += ANGLE_STEP
        ) {
            const distance = 1000;

            const targetX = startPos.x + Math.cos(currentAngle) * distance;
            const targetY = startPos.y + Math.sin(currentAngle) * distance;

            const originPos = generateBulletOriginPosition(startPos.x, startPos.y, targetX, targetY);
            const shootInfo: ShootInfo = {
                originX: originPos.x,
                originY: originPos.y,

                targetX: targetX,
                targetY: targetY,

                force: SHOT_CONST.MIN_SHOT_FORCE,
            }

            for (
                let currentForce = SHOT_CONST.MIN_SHOT_FORCE;
                currentForce <= SHOT_CONST.BASE_MAX_SHOT_FORCE;
                currentForce += FORCE_STEP
            ) {
                shootInfo.force = currentForce;

                this.resetCurrentTrajectory(shootInfo);
                simulateShot(shootInfo, (x, y) => { return this.shotStepCallback(x, y, targetPos, terrain, bulletCount) });

                if (this.currentTrajectory.useful) {
                    if (this.currentTrajectory.hitType === bestTrajectory.hitType) {
                        if (this.currentTrajectory.collisionNumber <= bestTrajectory.collisionNumber) {
                            bestTrajectory = structuredClone(this.currentTrajectory);
                        }
                    } else if (this.currentTrajectory.hitType === HitType.Direct) {
                        bestTrajectory = structuredClone(this.currentTrajectory);
                    }
                }

                if (stopCondition(bestTrajectory)) return bestTrajectory;
            }
        }

        return bestTrajectory;
    }

    findBestTrajectory(startPos: Position, targetPos: Position, terrain: QuadBlock, bulletCount: number): CalculatedTrajectory {
        return this.iterateThroughTrajectories(
            startPos,
            targetPos,
            terrain,
            bulletCount,
            (traj) => traj.hitType === HitType.Direct && traj.collisionNumber === 0
        );
    }

    isTargetable(startPos: Position, targetPos: Position, terrain: QuadBlock, bulletCount: number): boolean {
        return this.iterateThroughTrajectories(
            startPos,
            targetPos,
            terrain,
            bulletCount,
            (traj) => traj.useful
        ).useful;
    }
}