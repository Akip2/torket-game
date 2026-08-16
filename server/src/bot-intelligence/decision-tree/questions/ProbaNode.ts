import TreeNode from "../TreeNode";
import QuestionNode from "./QuestionNode";

export default class ProbaNode extends QuestionNode {
    private trueProba: number;

    constructor(trueProba: number) {
        super();
        if (trueProba < 0 || trueProba > 1) {
            throw new Error("Invalid trueProba");
        }

        this.trueProba = trueProba;
    }

    protected evaluate(): boolean {
        return this.trueProba > Math.random();
    }
}