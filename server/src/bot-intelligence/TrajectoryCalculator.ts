import { BULLET_CONST, EXPLOSION_CONST, PLAYER_CONST, SHOT_CONST } from "@shared/const";
import { generateBulletOriginPosition, simulateShot } from "@shared/logics/bullet-logic";
import { CalculatedTrajectory, Position, ShootInfo } from "@shared/types";
import QuadBlock from "@shared/data/QuadBlock";

export default class TrajectoryCalculator {
    private currentTrajectory!: CalculatedTrajectory;

    private playerPositionInRadius(x: number, y: number, playerPos: Position) {
        const dist = Math.sqrt(
            (x - playerPos.x) ** 2
            +
            (y - playerPos.y) ** 2
        );

        return dist < EXPLOSION_CONST.BASE_RADIUS + (PLAYER_CONST.BASE_WIDTH / 2);
    }

    private shotStepCallback(x: number, y: number, playerPos: Position, terrain: QuadBlock, bulletCount: number) {
        const endCondition = this.currentTrajectory.hitTarget || (this.currentTrajectory.collisionNumber >= bulletCount);
        if (endCondition) return;

        if (this.playerPositionInRadius(x, y, playerPos)) { // hits player
            this.currentTrajectory.hitTarget = true;
            this.currentTrajectory.useful = true;
        }

        if (terrain.collidesWithCircle(x, y, BULLET_CONST.RADIUS)) {
            this.currentTrajectory.collisionNumber += 1;
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
            hitTarget: false,
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
            const targetX = playerPos.x + Math.cos(currentAngle);
            const targetY = playerPos.y + Math.sin(currentAngle);

            const originPos = generateBulletOriginPosition(botPos.x, botPos.y, targetX, targetY);
            const shootInfo: ShootInfo = {
                originX: originPos.x,
                originY: originPos.y,

                targetX: targetX,
                targetY: targetY,

                force: SHOT_CONST.MIN_SHOT_FORCE + 10,
            }

            for (
                let currentForce = SHOT_CONST.MIN_SHOT_FORCE + 10;
                currentForce <= SHOT_CONST.BASE_MAX_SHOT_FORCE;
                currentForce += forceStep
            ) {
                shootInfo.force = currentForce;

                this.resetCurrentTrajectory(shootInfo);
                simulateShot(shootInfo, (x, y) => { this.shotStepCallback(x, y, playerPos, terrain, bulletCount) });

                if (bestTrajectory) {
                    if (bestTrajectory.useful) {
                        if (this.currentTrajectory.useful && this.currentTrajectory.collisionNumber < bestTrajectory.collisionNumber) {
                            bestTrajectory = structuredClone(this.currentTrajectory);
                        }
                    } else if(this.currentTrajectory.useful) {
                        bestTrajectory = structuredClone(this.currentTrajectory);
                    }
                } else {
                    bestTrajectory = structuredClone(this.currentTrajectory);
                }
            }
        }

        return bestTrajectory;
    }
}