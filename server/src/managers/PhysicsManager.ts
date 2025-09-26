import { GRAVITY } from "@shared/const";
import { Body, Engine, World } from "matter-js";
import GameBody from "src/bodies/GameBody";

export default class PhysicsManager {
    engine: Engine;

    constructor() {
        this.engine = Engine.create({
            gravity: { x: 0, y: GRAVITY }
        });
    }

    update(deltaTime: number) {
        Engine.update(this.engine, deltaTime);
    }

    add(gameBody: GameBody) {
        gameBody.addToWorld(this.engine.world);
    }

    remove(gameBody: GameBody) {
        gameBody.removeFromWorld(this.engine.world);
    }

    removeBrut(body: Body) {
        World.remove(this.engine.world, body);
    }
}