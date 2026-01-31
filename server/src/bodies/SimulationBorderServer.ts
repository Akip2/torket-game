import { Bodies } from "matter-js";
import GameBody from "./GameBody";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { Border } from "@shared/enums/Border.enum";
import { BORDERS_CONST } from "@shared/const";

export default class SimulationBorderServer extends GameBody {
    constructor(placement: Border) {
        super();

        const {x, y, width, height} = BORDERS_CONST[placement];

        this.body = Bodies.rectangle(x, y, width, height, {
            friction: 0,
            frictionAir: 0,
            frictionStatic: 0,
            isStatic: true,
            label: RessourceKeys.Border
        });
    }
}