import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import type { IPlayer } from "@shared/interfaces/Player.interface";
import type GameScene from "../scenes/GameScene";
import Gun from "./Gun";
import { CLIENT_PREDICTION, PLAYER_CONST } from "@shared/const";
import Bar from "../ui/Bar";
import { BarStyle } from "../ui/ui-styles";
import type { Position } from "@shared/types";
import { Depths } from "@shared/enums/Depths.eunum";
import NameTag from "../ui/NameTag";

export default class PlayerClient extends Phaser.Physics.Matter.Sprite implements IPlayer {
    isMoving: boolean;
    isOnGround: boolean;

    hp: number = PLAYER_CONST.MAX_HP;
    isAlive: boolean = true;

    gun: Gun;
    healthBar: Bar;
    nameTag: NameTag;

    constructor(scene: GameScene, name: string, x: number, y: number) {
        super(scene.matter.world, x, y, RessourceKeys.Player);

        this.setFixedRotation();

        if (CLIENT_PREDICTION) {
            this.setFriction(0, 0.05, 0)
        } else { // disable physics
            this.setIgnoreGravity(true);
            this.setStatic(true);
            this.setCollidesWith([]);
            this.setFixedRotation();
            this.setFriction(0, 0, 0);
        }

        scene.add.existing(this);
        (this.body as MatterJS.BodyType).label = RessourceKeys.Player;
        this.setDepth(Depths.Third)

        this.isMoving = false;
        this.isOnGround = false;

        this.gun = new Gun(scene, x, y);
        this.healthBar = new Bar(scene, this.x, this.y, 1, BarStyle.Player);
        this.nameTag = new NameTag(scene, name, x, y);
    }

    updateGunPlacement(targetPosition: Position) {
        const dx = targetPosition.x - this.x;
        const dy = targetPosition.y - this.y;
        const angle = Math.atan2(dy, dx) * 180 / Math.PI;

        if (Math.abs(angle) > 90) {
            this.gun.setScale(1, -1);
        } else {
            this.gun.setScale(1, 1);
        }

        this.gun.setPosition(this.x, this.y);
        this.gun.setAngle(angle);
    }

    updateUI() {
        this.healthBar.updateGraphics(this.x, this.y, this.hp / PLAYER_CONST.MAX_HP);
        this.nameTag.updatePlacement(this.x, this.y);
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

    destroy(fromScene?: boolean): void {
        this.gun?.destroy(fromScene);
        this.healthBar?.destroy(fromScene);
        super.destroy(fromScene);
    }
}