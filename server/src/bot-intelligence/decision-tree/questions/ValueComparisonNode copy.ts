import { Operation } from "@shared/enums/Operation.enum";
import QuestionNode from "./QuestionNode";
import { ValueGetter } from "../value-getters/ValueGetter";
import { ComparableValue } from "@shared/types";

const COMPARE = {
  [Operation.SUP]: (a: ComparableValue, b: ComparableValue) => a > b,
  [Operation.SUP_EQ]: (a: ComparableValue, b: ComparableValue) => a >= b,
  [Operation.EQ]: (a: ComparableValue, b: ComparableValue) => a === b,
  [Operation.INF]: (a: ComparableValue, b: ComparableValue) => a < b,
  [Operation.INF_EQ]: (a: ComparableValue, b: ComparableValue) => a <= b,
};

export default class ValueComparisonNode extends QuestionNode {
    constructor(private firstValue: ValueGetter, private secondValue: ValueGetter, private operation: Operation) {
        super();
    }
    
    protected evaluate(): boolean {
        return COMPARE[this.operation](this.firstValue.getValue(), this.secondValue.getValue());
    }
}