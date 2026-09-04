import BotIntelligence from "../../../BotIntelligence";
import ActionNode from "./ActionNode";

export default class TrajectoryCalculationNode extends ActionNode {
    constructor(botIntelligence: BotIntelligence, private fromSelf: boolean = true) {
        super(botIntelligence);
    }

    execute(): void {
        const perception = this.botIntelligence.getBotPerception();

        let originPos, targetPos;
        if (this.fromSelf) {
            originPos = perception.selfPosition;
            targetPos = perception.otherPlayerPosition;
        } else {
            originPos = perception.otherPlayerPosition;
            targetPos = perception.selfPosition;
        }

        this.botIntelligence.memorizeBestTrajectory(
            originPos,
            targetPos
        );
    }
}