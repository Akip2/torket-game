import BotIntelligence from "../../../BotIntelligence";
import LinearNode from "../LinearNode";
export default abstract class ActionNode extends LinearNode {
    constructor(protected botIntelligence: BotIntelligence) {
        super();
    }

    abstract execute(): void
}