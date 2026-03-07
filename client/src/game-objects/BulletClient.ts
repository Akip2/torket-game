import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import type { IBasicBody } from "@shared/interfaces/BasicBody.interface";
import type GameScene from "../scenes/GameScene";
import type { Position } from "@shared/types";
import { Depths } from "@shared/enums/Depths.eunum";
import { BULLET_CONST, GRAVITY } from "@shared/const";

export default class BulletClient extends Phaser.Physics.Matter.Sprite implements IBasicBody {
    private lastTrailX: number = 0;
    private lastTrailY: number = 0;
    private eventsActive: boolean = true;
    private gravityScale: number;

    constructor(scene: GameScene, x: number, y: number, gravityScale: number = BULLET_CONST.GRAVITY_SCALE) {
        super(scene.matter.world, x, y, RessourceKeys.Bullet);

        scene.add.existing(this);

        (this.body as MatterJS.BodyType).label = RessourceKeys.Bullet;

        this.gravityScale = gravityScale;
        this.lastTrailX = x;
        this.lastTrailY = y;

        this.scene.events.on('fixed-tick', this.updateCallback, this);

        this.setIgnoreGravity(true);
    }

    private updateCallback() {
        if (this.eventsActive) {
            this.updateTrail();
            this.applyCustomGravity();
        }
    }

    private updateTrail() {
        const distance = Phaser.Math.Distance.Between(
            this.lastTrailX,
            this.lastTrailY,
            this.x,
            this.y
        );

        if (distance >= BULLET_CONST.TRAIL_DISTANCE) {
            this.createTrailParticle(this.lastTrailX, this.lastTrailY);
            this.lastTrailX = this.x;
            this.lastTrailY = this.y;
        }
    }

    private createTrailParticle(x: number, y: number) {
        const particle = (this.scene as GameScene).add.circle(x, y, 3, 0xff2700, 0.6);
        particle.setDepth(Depths.None - 1);

        (this.scene as GameScene).tweens.add({
            targets: particle,
            scale: 0.2,
            alpha: 0,
            duration: 300,
            ease: 'Quad.easeOut',
            onComplete: () => particle.destroy()
        });
    }

    getPosition(): Position {
        return { x: this.x, y: this.y };
    }

    destroy(fromScene?: boolean | undefined): void {
        this.scene.events.off('fixed-tick', this.updateTrail, this);
        this.eventsActive = false;
        super.destroy(fromScene);
    }

    private applyCustomGravity() {
        const gravityForce =
            (this.body as MatterJS.BodyType).mass *
            GRAVITY *
            0.001 *
            this.gravityScale;
        
        this.applyForce(new Phaser.Math.Vector2(0, gravityForce));
    }
}