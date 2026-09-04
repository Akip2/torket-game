import { Body, Bodies, Vertices } from "matter-js";
import GameBody from "./GameBody";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";

export default class TerrainBlock extends GameBody {
    constructor(x: number, y: number, width: number, height: number) {
        const body = Bodies.rectangle(x, y, width, height, {
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            isStatic: true,
            label: RessourceKeys.Ground
        });

        super(body);
    }

    setBounds(x: number, y: number, width: number, height: number) {
        Body.setPosition(this.body, { x, y });
        Body.setVertices(this.body, Vertices.fromPath(
            `${-width / 2} ${-height / 2} ${width / 2} ${-height / 2} ` +
            `${width / 2} ${height / 2} ${-width / 2} ${height / 2}`,
            this.body
        ));
        Body.setPosition(this.body, { x, y });
    }
}