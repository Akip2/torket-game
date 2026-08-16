import TreeNode from "../TreeNode";

export default abstract class ActionNode implements TreeNode {
    private nextNode?: TreeNode;

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