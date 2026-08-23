import ActionNode from "./ActionNode";

export default class MovementCalculationNode extends ActionNode {
    execute(): void {
        this.botIntelligence.memorizeBestMovements();
    }
}