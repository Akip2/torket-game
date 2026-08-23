import ActionNode from "./ActionNode";

export default class MoveNode extends ActionNode {
    async execute(): Promise<void> {
        await this.botIntelligence.playMemorizedMovements();
    }
}