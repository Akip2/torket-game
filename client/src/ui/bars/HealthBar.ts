import type { BarStyleType } from "@shared/types";
import type GameScene from "client/src/scenes/GameScene";
import Bar from "./Bar";
import { HEALTH_TRANSITION_DURATION } from "@shared/const";

export default class HealthBar extends Bar {
    constructor(
        scene: GameScene,
        x: number = 0,
        y: number = 0,
        value: number = 1,
        style: BarStyleType
    ) {
        super(scene, x, y, value, style, HEALTH_TRANSITION_DURATION);
    }

    /**
     * Get color based on health percentage
     */
    protected getCustomBarColor(percentage: number): number {
        if (percentage > 0.67) {
            return 0x00ff44; // Green
        } else if (percentage > 0.33) {
            return 0xffaa00; // Orange
        } else {
            return 0xff3333; // Red
        }
    }
}