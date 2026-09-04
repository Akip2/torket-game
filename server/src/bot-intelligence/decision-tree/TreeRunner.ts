import EndNode from "./nodes/EndNode";
import TreeNode from "./nodes/TreeNode";

export default class TreeRunner {
    private currentNode: TreeNode | null
    private runId: number;

    constructor() {
        this.currentNode = null;
        this.runId = 0;
    }

    async run(tree: TreeNode) {
        const myRunId = ++this.runId;
        this.currentNode = tree;

        while (this.isRunning() && myRunId === this.runId) {
            await this.currentNode.execute();

            if (this.runId !== myRunId) return;
            this.currentNode = this.currentNode?.getNext();
        }
    }

    isRunning() {
        return !((this.currentNode instanceof EndNode) || this.currentNode === null);
    }
}