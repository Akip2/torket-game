import { SHOT_CONST } from "@shared/const";
import ActionNode from "./ActionNode";

export default class ShootNode extends ActionNode {
    async execute(): Promise<void> {
        const imprecision = Math.random() * SHOT_CONST.BOT_IMPRECISION;
        await this.botIntelligence.shootCalculatedTrajectory(imprecision);
    }
}