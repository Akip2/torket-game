import { Action } from "@shared/enums/Action.enum";
import ActionNode from "./actions/ActionChoiceNode";
import TreeNode from "./TreeNode";
import BotIntelligence from "../BotIntelligence";
import ProbaNode from "./questions/ProbaNode";
import EndNode from "./EndNode";
import EndTurnNode from "./actions/EndTurnNode";

const END = new EndNode();

export function createActionChoiceDecisionTree(botIntelligence: BotIntelligence): TreeNode {
    const probaChoice = new ProbaNode(0.75);

    const moveActionChoice = new ActionNode(botIntelligence, Action.Move);
    const shootActionChoice = new ActionNode(botIntelligence, Action.Shoot);

    probaChoice.setFalseNode(shootActionChoice);
    probaChoice.setTrueNode(moveActionChoice);
    
    moveActionChoice.setNextNode(END);
    shootActionChoice.setNextNode(END);

    return probaChoice;
}

export function createMovingDecisionTree(botIntelligence: BotIntelligence): TreeNode {
    //TODO
    return new EndTurnNode(botIntelligence);
}

export function createShootingDecisionTree(botIntelligence: BotIntelligence): TreeNode {
    //TODO
    return new EndTurnNode(botIntelligence);
}