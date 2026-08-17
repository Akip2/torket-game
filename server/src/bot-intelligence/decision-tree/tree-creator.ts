import { Action } from "@shared/enums/Action.enum";
import ActionNode from "./actions/ActionChoiceNode";
import TreeNode from "./TreeNode";
import BotIntelligence from "../BotIntelligence";
import ProbaNode from "./questions/ProbaNode";
import EndNode from "./EndNode";
import EndTurnNode from "./actions/EndTurnNode";
import ValueComparisonNode from "./questions/ValueComparisonNode";
import PerceptionValue from "./value-getters/PerceptionValue";
import { BotPerceptionKey } from "@shared/enums/BotPerceptionKey.enum";
import StaticValue from "./value-getters/StaticValue";
import { Operation } from "@shared/enums/Operation.enum";
import ActionChoiceNode from "./actions/ActionChoiceNode";

const END = new EndNode();

export function createActionChoiceDecisionTree(botIntelligence: BotIntelligence): TreeNode {
    const hasMunitions = new ValueComparisonNode(
        new PerceptionValue(botIntelligence.botPerception, BotPerceptionKey.SelfBulletCount),
        new StaticValue(0),
        Operation.SUP
    );

    const probaNoMunitions = new ProbaNode(0.7);

    const chooseReload = new ActionChoiceNode(botIntelligence, Action.Reload);
    const chooseMove = new ActionChoiceNode(botIntelligence, Action.Move);
    const chooseShoot = new ActionChoiceNode(botIntelligence, Action.Shoot);

    hasMunitions.setTrueNode(chooseShoot); // TODO
    hasMunitions.setFalseNode(probaNoMunitions);

    probaNoMunitions.setTrueNode(chooseReload);
    probaNoMunitions.setFalseNode(chooseMove);

    chooseMove.setNextNode(END);
    chooseReload.setNextNode(END);

    return hasMunitions;
}

export function createMovingDecisionTree(botIntelligence: BotIntelligence): TreeNode {
    //TODO
    return new EndTurnNode(botIntelligence);
}

export function createShootingDecisionTree(botIntelligence: BotIntelligence): TreeNode {
    //TODO
    return new EndTurnNode(botIntelligence);
}