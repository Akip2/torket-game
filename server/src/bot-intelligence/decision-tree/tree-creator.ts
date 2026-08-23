import { PLAYER_CONST } from "@shared/const";
import { Action } from "@shared/enums/Action.enum";
import { BotMemoryKey } from "@shared/enums/BotMemoryKey.enum";
import { BotPerceptionKey } from "@shared/enums/BotPerceptionKey.enum";
import { Operation } from "@shared/enums/Operation.enum";
import BotIntelligence from "../BotIntelligence";
import ActionChoiceNode from "./nodes/actions/ActionChoiceNode";
import EndTurnNode from "./nodes/actions/EndTurnNode";
import ShootNode from "./nodes/actions/ShootNode";
import StartListeningNode from "./nodes/actions/StartListeningNode";
import TrajectoryCalculationNode from "./nodes/actions/TrajectoryCalculationNode";
import EndNode from "./nodes/EndNode";
import ProbaNode from "./nodes/questions/ProbaNode";
import TrueCheckerNode from "./nodes/questions/TrueCheckerNode";
import ValueComparisonNode from "./nodes/questions/ValueComparisonNode";
import TreeNode from "./nodes/TreeNode";
import WaitingNode from "./nodes/WaitingNode";
import MemoryValue from "./value-getters/MemoryValue";
import PerceptionValue from "./value-getters/PerceptionValue";
import StaticValue from "./value-getters/StaticValue";
import MoveTowardsPlayerNode from "./nodes/actions/MoveTowardsPlayerNode";
import MovementCalculationNode from "./nodes/actions/MovementCalculattionNode";
import MoveNode from "./nodes/actions/MoveNode";

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
    const listen = new StartListeningNode(botIntelligence);
    const calculateBestMovements = new MovementCalculationNode(botIntelligence);
    const move = new MoveNode(botIntelligence);
    const hasMovementLeft = new ValueComparisonNode(
        new PerceptionValue(botIntelligence.getBotPerception(), BotPerceptionKey.SelfMovementLeft),
        new StaticValue(0),
        Operation.SUP
    );
    const endTurn = new EndTurnNode(botIntelligence);

    listen.setNextNode(calculateBestMovements);
    calculateBestMovements.setNextNode(move);
    move.setNextNode(hasMovementLeft);
    hasMovementLeft.setFalseNode(endTurn);
    hasMovementLeft.setTrueNode(calculateBestMovements);

    return listen;
}

export function createShootingDecisionTree(botIntelligence: BotIntelligence): TreeNode {
    const listen = new StartListeningNode(botIntelligence);

    const shoot = new ShootNode(botIntelligence);

    const hasMunitions = new ValueComparisonNode(
        new PerceptionValue(botIntelligence.getBotPerception(), BotPerceptionKey.SelfBulletCount),
        new StaticValue(0),
        Operation.SUP
    );

    const waitAfterShot = new WaitingNode(2);

    const calculateBestTrajectory = new TrajectoryCalculationNode(botIntelligence);
    const usefulShot = new TrueCheckerNode
        (
            new MemoryValue(botIntelligence.getBotMemory(), BotMemoryKey.UsefulTrajectory
            )
        );

    const endTurn = new EndTurnNode(botIntelligence);

    listen.setNextNode(shoot);
    shoot.setNextNode(hasMunitions);

    hasMunitions.setTrueNode(waitAfterShot);
    hasMunitions.setFalseNode(END);

    waitAfterShot.setNextNode(calculateBestTrajectory);

    calculateBestTrajectory.setNextNode(usefulShot);

    usefulShot.setTrueNode(shoot);
    usefulShot.setFalseNode(endTurn);

    return listen;
}