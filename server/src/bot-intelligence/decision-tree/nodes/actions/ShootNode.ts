import { SHOT_CONST } from "@shared/const";
import ActionNode from "./ActionNode";

export default class ShootNode extends ActionNode {
    async execute(): Promise<void> {
        await this.botIntelligence.shootCalculatedTrajectory();
    }
}