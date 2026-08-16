import { PLAYER_CONST } from "@shared/const";
import { Player } from "../rooms/schema/MyRoomState";
import PlayerServer from "./PlayerServer";
import { InputPayload } from "@shared/types";
import { PhaseTypes } from "@shared/enums/PhaseTypes.enum";
import { MyRoom } from "../rooms/MyRoom";
import BotIntelligence from "../bot-intelligence/BotIntelligence";
import TreeNode from "../bot-intelligence/decision-tree/TreeNode";
import { createActionChoiceDecisionTree, createMovingDecisionTree, createShootingDecisionTree } from "../bot-intelligence/decision-tree/tree-creator";
import TreeRunner from "../bot-intelligence/decision-tree/TreeRunner";

export default class Bot extends PlayerServer {
    currentInputs!: InputPayload;
    private phaseToDecisionTree: Map<PhaseTypes, TreeNode>;
    private treeRunner: TreeRunner;

    constructor(
        playerRef: Player,
        sessionId: string,
        room: MyRoom,
        onDamage: (hp: number, damage?: number, directHit?: boolean) => void,
        size: number = PLAYER_CONST.BASE_WIDTH
    ) {
        super(playerRef, sessionId, onDamage, size);

        const botIntelligence = new BotIntelligence(room, this);
        this.phaseToDecisionTree = new Map([
            [PhaseTypes.ActionChoice, createActionChoiceDecisionTree(botIntelligence)],
            [PhaseTypes.Shooting, createShootingDecisionTree(botIntelligence)],
            [PhaseTypes.Moving, createMovingDecisionTree(botIntelligence)],
        ]);

        this.treeRunner = new TreeRunner();

        this.resetInputs();
    }

    private resetInputs() {
        this.currentInputs = {
            up: false,
            down: false,
            right: false,
            left: false,

            mousePosition: { x: this.getX(), y: this.getY() },
            timeStamp: 0,
        }
    }

    async runAlgo(currentPhaseType: PhaseTypes) {
        const tree = this.phaseToDecisionTree.get(currentPhaseType);
        if (tree) this.treeRunner.run(tree);
    }
}