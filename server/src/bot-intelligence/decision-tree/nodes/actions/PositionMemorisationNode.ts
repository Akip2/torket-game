import ActionNode from "./ActionNode";

export default class PositionMemorisationNode extends ActionNode {
    execute(): void {
        this.botIntelligence.memorizeBotPosition();
    }
}