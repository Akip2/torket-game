export default interface TreeNode {
    execute(): void;
    getNext(): TreeNode;
}