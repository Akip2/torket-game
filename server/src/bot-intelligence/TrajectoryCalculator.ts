import { BULLET_CONST, EXPLOSION_CONST, PLAYER_CONST, SHOT_CONST } from "@shared/const";
import { generateBulletOriginPosition, simulateShot } from "@shared/logics/bullet-logic";
import { CalculatedTrajectory, Position, ShootInfo } from "@shared/types";
import QuadBlock from "@shared/data/QuadBlock";
import { HitType } from "@shared/enums/HitType.enum";

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
        const endCondition = this.currentTrajectory.hitType === HitType.Direct || (this.currentTrajectory.collisionNumber >= bulletCount);
        if (endCondition) return;

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

    findBestTrajectory(botPos: Position, playerPos: Position, terrain: QuadBlock, bulletCount: number): CalculatedTrajectory {
        const dx = playerPos.x - botPos.x;
        const dy = playerPos.y - botPos.y;

        const angleRange = Math.PI / 4;      // 45°
        const angleStep = Math.PI / 180;    // 1°

        const forceStep = 1;

        const baseAngle = Math.atan2(dy, dx);

        let bestTrajectory = this.generateBaseTrajectory();
        for (
            let currentAngle = baseAngle - angleRange;
            currentAngle <= baseAngle + angleRange;
            currentAngle += angleStep
        ) {
            const distance = 1000;

            const targetX = botPos.x + Math.cos(currentAngle) * distance;
            const targetY = botPos.y + Math.sin(currentAngle) * distance;

            const originPos = generateBulletOriginPosition(botPos.x, botPos.y, targetX, targetY);
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
                currentForce += forceStep
            ) {
                shootInfo.force = currentForce;

                this.resetCurrentTrajectory(shootInfo);
                simulateShot(shootInfo, (x, y) => { this.shotStepCallback(x, y, playerPos, terrain, bulletCount) });

                if (this.currentTrajectory.useful) {
                    if (this.currentTrajectory.hitType === bestTrajectory.hitType) {
                        if (this.currentTrajectory.collisionNumber <= bestTrajectory.collisionNumber) {
                            bestTrajectory = structuredClone(this.currentTrajectory);
                        }
                    } else if (this.currentTrajectory.hitType === HitType.Direct) {
                        bestTrajectory = structuredClone(this.currentTrajectory);
                    }
                }
            }
        }

        return bestTrajectory;
    }
}