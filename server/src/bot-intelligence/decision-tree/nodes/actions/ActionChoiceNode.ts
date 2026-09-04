import { Action } from "@shared/enums/Action.enum";
import ActionNode from "./ActionNode";
import BotIntelligence from "../../../BotIntelligence";

export default class ActionChoiceNode extends ActionNode {
    constructor(botIntelligence: BotIntelligence, private action: Action) { 
        super(botIntelligence);
    }

    execute() {
        this.botIntelligence.chooseAction(this.action);
    }
}