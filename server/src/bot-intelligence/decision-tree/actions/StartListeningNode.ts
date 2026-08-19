import ActionNode from "./ActionNode";

export default class StartListeningNode extends ActionNode {
    execute(): void {
        this.botIntelligence.listenToInputs();
    }
}