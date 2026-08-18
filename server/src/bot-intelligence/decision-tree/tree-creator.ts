import { Action } from "@shared/enums/Action.enum";
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
import TrajectoryCalculationNode from "./actions/TrajectoryCalculationNode";
import TrueCheckerNode from "./questions/TrueCheckerNode";
import MemoryValue from "./value-getters/MemoryValue";
import { BotMemoryKey } from "@shared/enums/BotMemoryKey.enum";
import { PLAYER_CONST } from "@shared/const";

const END = new EndNode();

export function createActionChoiceDecisionTree(botIntelligence: BotIntelligence): TreeNode {
    const perception = botIntelligence.getBotPerception();
    const memory = botIntelligence.getBotMemory();

    const hasMunitions = new ValueComparisonNode(
        new PerceptionValue(perception, BotPerceptionKey.SelfBulletCount),
        new StaticValue(0),
        Operation.SUP
    );

    const probaNoMunitions = new ProbaNode(0.7);

    const chooseReload = new ActionChoiceNode(botIntelligence, Action.Reload);
    const chooseMove = new ActionChoiceNode(botIntelligence, Action.Move);
    const chooseShoot = new ActionChoiceNode(botIntelligence, Action.Shoot);

    const calculateBestTrajectory = new TrajectoryCalculationNode(botIntelligence);
    const usefulShot = new TrueCheckerNode
        (
            new MemoryValue(memory, BotMemoryKey.UsefulTrajectory
            )
    );
    
    const atMaxMunitions = new ValueComparisonNode(
        new PerceptionValue(perception, BotPerceptionKey.SelfBulletCount),
        new StaticValue(PLAYER_CONST.BASE_MAX_BULLET_COUNT),
        Operation.EQ
    );

    hasMunitions.setTrueNode(calculateBestTrajectory);
    hasMunitions.setFalseNode(probaNoMunitions);

    calculateBestTrajectory.setNextNode(usefulShot);

    usefulShot.setTrueNode(chooseShoot);
    usefulShot.setFalseNode(atMaxMunitions);

    atMaxMunitions.setTrueNode(chooseMove);
    atMaxMunitions.setFalseNode(chooseReload);

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