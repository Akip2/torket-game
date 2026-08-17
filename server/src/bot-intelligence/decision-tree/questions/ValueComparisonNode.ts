import { Operation } from "@shared/enums/Operation.enum";
import QuestionNode from "./QuestionNode";
import { ValueGetter } from "../value-getters/ValueGetter";

const COMPARE = {
  [Operation.SUP]: (a: number, b: number) => a > b,
  [Operation.SUP_EQ]: (a: number, b: number) => a >= b,
  [Operation.EQ]: (a: number, b: number) => a === b,
  [Operation.INF]: (a: number, b: number) => a < b,
  [Operation.INF_EQ]: (a: number, b: number) => a <= b,
};

export default class ValueComparisonNode extends QuestionNode {
    constructor(private firstValue: ValueGetter, private secondValue: ValueGetter, private operation: Operation) {
        super();
    }
    
    protected evaluate(): boolean {
        return COMPARE[this.operation](this.firstValue.getValue(), this.secondValue.getValue());
    }
}