import { Bodies } from "matter-js";
import GameBody from "./GameBody";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";

export default class SimulationBorderServer extends GameBody {
    constructor(x: number, y: number, width: number, height: number, isBottomBorder: boolean = false) {
        const body = Bodies.rectangle(x, y, width, height, {
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            isStatic: true,
            label: RessourceKeys.Border,
            plugin: isBottomBorder
        });

        super(body);
    }
}