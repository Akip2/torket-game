import { Action } from "@shared/enums/Action.enum";
import { ExplosionInfo, ShootInfo } from "@shared/types";
import { MyRoom } from "../rooms/MyRoom";
import { canPlayerShoot } from "@shared/logics/player-logic";
import { generateBulletOriginPosition, shoot } from "@shared/logics/bullet-logic";
import BulletServer from "../bodies/BulletServer";
import { BULLET_CONST } from "@shared/const";
import { Parameter } from "@shared/enums/Parameter.enum";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import { Client } from "colyseus";

export default class GameActionManager {
    handleShoot: (sessionId: string, shootInfo: ShootInfo, client?: Client) => void
    handleActionChoice: (sessionId: string, action: Action) => void
    handleEndTurn: (sessionId: string) => void

    constructor(room: MyRoom) {
        this.handleEndTurn = (sessionId: string) => {
            room.phaseManager.endTurn(sessionId);
        }

        this.handleActionChoice = (sessionId: string, action: Action) => {
            room.phaseManager.actionChoice(sessionId, action);
        }

        this.handleShoot = (sessionId: string, shootInfo: ShootInfo, client?: Client) => {
            const playerBody = room.playerManager.getPlayer(sessionId);
            if (!playerBody) return;

            if (canPlayerShoot(playerBody)) {
                //this.phaseManager.disableAction(playerBody);
                playerBody.decreaseBulletCount();
            } else { // can't shoot, refusing action
                return;
            }

            const originPosition = generateBulletOriginPosition(playerBody.getX(), playerBody.getY(), shootInfo.targetX, shootInfo.targetY, playerBody.powerManager.getParameterValue(Parameter.Size));

            const explosionInfo: ExplosionInfo = {
                explosionPushCoef: playerBody.powerManager.getParameterValue(Parameter.ExpPush),
                explosionSize: playerBody.powerManager.getParameterValue(Parameter.ExpSize),
                damage: playerBody.powerManager.getParameterValue(Parameter.Damage),
            };

            const bullet = new BulletServer(
                originPosition.x,
                originPosition.y,
                BULLET_CONST.RADIUS,
                explosionInfo,
                playerBody.getTeam()
            );

            room.bullets.push(bullet);
            room.physicsManager.add(bullet);

            shoot(bullet, shootInfo.targetX, shootInfo.targetY, shootInfo.force);

            shootInfo.originX = originPosition.x;
            shootInfo.originY = originPosition.y;
            room.broadcast(RequestTypes.Shoot, {
                shootInfo: shootInfo,
                explosionInfo: explosionInfo
            }, { except: client });
        }
    }
}