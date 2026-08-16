import { Action } from "@shared/enums/Action.enum";
import BotIntelligence from "../../BotIntelligence";
import ActionNode from "./ActionNode";

export default class ActionChoiceNode extends ActionNode {
    constructor(botIntelligence: BotIntelligence, private action: Action) { 
        super(botIntelligence);
    }

    execute() {
        this.botIntelligence.chooseAction(this.action);
    }
}