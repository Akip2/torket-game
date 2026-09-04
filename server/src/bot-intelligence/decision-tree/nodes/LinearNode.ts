import TreeNode from "./TreeNode";

export default abstract class LinearNode implements TreeNode {
    protected nextNode?: TreeNode

    abstract execute(): void

    setNextNode(nextNode: TreeNode) {
        this.nextNode = nextNode;
    }

    getNext(): TreeNode {
        if (this.nextNode) {
            return this.nextNode;
        } else {
            throw new Error("No next node");
        }
    }
}