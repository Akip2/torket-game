import Matter, { World, Body } from "matter-js";

export default abstract class GameBody {
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

    addToWorld(world: World) {
        World.add(world, this.body);
    }

    removeFromWorld(world: World) {
        World.remove(world, this.body);
    }
}