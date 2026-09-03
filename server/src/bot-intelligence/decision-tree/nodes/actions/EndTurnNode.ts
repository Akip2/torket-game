import BotIntelligence from "../../../BotIntelligence";
import EndNode from "../EndNode";
import ActionNode from "./ActionNode";

export default class EndTurnNode extends ActionNode {
    constructor(botIntelligence: BotIntelligence) {
        super(botIntelligence);
        this.setNextNode(new EndNode());
    }
    
    execute(): void {
        this.botIntelligence.endTurn();
    }
}