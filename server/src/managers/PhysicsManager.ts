import { GRAVITY } from "@shared/const";
import { Border } from "@shared/enums/Border.enum";
import { Body, Engine, World } from "matter-js";
import GameBody from "src/bodies/GameBody";
import SimulationBorderServer from "src/bodies/SimulationBorderServer";

export default class PhysicsManager {
    engine: Engine;

    constructor() {
        this.engine = Engine.create({
            gravity: { x: 0, y: GRAVITY }
        });

        this.generateBorders();
    }

    private generateBorders() {
        this.add(new SimulationBorderServer(Border.Top));
        this.add(new SimulationBorderServer(Border.Bottom));
        this.add(new SimulationBorderServer(Border.Right));
        this.add(new SimulationBorderServer(Border.Left));
    }

    update(deltaTime: number) {
        Engine.update(this.engine, deltaTime);
    }

    add(gameBody: GameBody) {
        gameBody.addToWorld(this.engine.world);
    }

    removeBrut(body: Body) {
        World.remove(this.engine.world, body);
    }
}