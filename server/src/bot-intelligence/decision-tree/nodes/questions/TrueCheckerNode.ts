import { Operation } from "@shared/enums/Operation.enum";
import ValueComparisonNode from "./ValueComparisonNode";
import { ValueGetter } from "../../value-getters/ValueGetter";
import StaticValue from "../../value-getters/StaticValue";

export default class TrueCheckerNode extends ValueComparisonNode {
    constructor(value: ValueGetter) {
        super(value, new StaticValue(true), Operation.EQ);
    }
}