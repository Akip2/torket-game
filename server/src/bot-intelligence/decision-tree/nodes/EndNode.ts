import TreeNode from "./TreeNode";

export default class EndNode implements TreeNode {
    execute(): void {
        console.log("Tree end");
    }

    getNext(): TreeNode {
        return this;
    }
}