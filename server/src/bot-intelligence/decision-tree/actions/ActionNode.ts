import BotIntelligence from "../../BotIntelligence";
import TreeNode from "../TreeNode";

export default abstract class ActionNode implements TreeNode {
    private nextNode?: TreeNode;

    constructor(protected botIntelligence: BotIntelligence) {
        
    }

    getNext(): TreeNode {
        if (this.nextNode) {
            return this.nextNode;
        } else {
            throw new Error("No next node");
        }
    }

    setNextNode(nextNode: TreeNode) {
        this.nextNode = nextNode;
    }

    abstract execute(): void
}