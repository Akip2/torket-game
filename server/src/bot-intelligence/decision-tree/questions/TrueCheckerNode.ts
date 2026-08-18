import { Operation } from "@shared/enums/Operation.enum";
import StaticValue from "../value-getters/StaticValue";
import { ValueGetter } from "../value-getters/ValueGetter";
import ValueComparisonNode from "./ValueComparisonNode";

export default class TrueCheckerNode extends ValueComparisonNode {
    constructor(value: ValueGetter) {
        super(value, new StaticValue(true), Operation.EQ);
    }
}