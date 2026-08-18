import ActionNode from "./ActionNode";

export default class TrajectoryCalculationNode extends ActionNode {
    execute(): void {
        this.botIntelligence.memorizeBestTrajectory();
    }
}