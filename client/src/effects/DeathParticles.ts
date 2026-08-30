import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import type GameScene from "../scenes/GameScene";
import { Depths } from "../enums/Depths.enum";

export class DeathParticles extends Phaser.GameObjects.Particles.ParticleEmitter {
    constructor(scene: GameScene) {
        super(scene, 0, 0, RessourceKeys.DeathParticle, {
            lifespan: 500,
            speed: { min: 80, max: 700 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.125, end: 0 },
            quantity: 500,
            gravityY: 50,
            blendMode: 'ADD',
            emitting: false
        });

        this.setDepth(Depths.Player);
        scene.add.existing(this);
    }

    activate(x: number, y: number) {
        this.setPosition(x, y);
        this.explode(50);
    }
}