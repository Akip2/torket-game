import { IBasicBody } from "@shared/interfaces/BasicBody.interface";
import Matter, { World, Body } from "matter-js";

export default abstract class GameBody implements IBasicBody {
    body: Body;

    getX() {
        return this.body.position.x;
    }

    getY() {
        return this.body.position.y;
    }

    setPosition(x: number, y: number) {
        Matter.Body.setPosition(this.body, { x, y });
    }

    getVelocity() {
        return this.body.velocity;
    }

    getPosition() {
        return this.body.position;
    }

    setVelocity(x: number, y: number) {
        Matter.Body.setVelocity(this.body, { x, y });
    }

    setVelocityY(y: number): void {
        this.setVelocity(this.body.velocity.x, y);
    }

    setVelocityX(x: number): void {
        this.setVelocity(x, this.body.velocity.y);
    }

    addToWorld(world: World) {
        World.add(world, this.body);

        this.removeFromWorld = () => {
            World.remove(world, this.body);
        }
    }

    removeFromWorld() {
        throw new Error("GameBody wasn't added to the world");
    }
}