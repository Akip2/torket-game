import TreeNode from "../TreeNode";

export default abstract class QuestionNode implements TreeNode {
    private trueNode?: TreeNode;
    private falseNode?: TreeNode;

    getNext(): TreeNode {
        if (this.evaluate()) {
            if (this.trueNode) {
                return this.trueNode;
            } else {
                throw new Error("No true node");
            }
        } else {
            if (this.falseNode) {
                return this.falseNode;
            } else {
                throw new Error("No false node");
            }
        }
    }

    setTrueNode(trueNode: TreeNode) {
        this.trueNode = trueNode;
    }

    setFalseNode(falseNode: TreeNode) {
        this.falseNode = falseNode;
    }

    protected abstract evaluate(): boolean;

    execute() {

    }
}