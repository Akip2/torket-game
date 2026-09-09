import ActionNode from "./ActionNode";

export default class WaitForStabilityNode extends ActionNode {
    async execute(): Promise<void> {
        await this.botIntelligence.waitForStability();
    }
}