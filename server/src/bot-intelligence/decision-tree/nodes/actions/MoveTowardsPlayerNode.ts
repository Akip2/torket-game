import ActionNode from "./ActionNode";

export default class MoveTowardsPlayerNode extends ActionNode {
    async execute(): Promise<void> {
        await this.botIntelligence.moveTowards(this.botIntelligence.getBotPerception().otherPlayerPosition);
    }
}