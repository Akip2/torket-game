import { ComparableValue } from "@shared/types";
import { ValueGetter } from "./ValueGetter";

export default class StaticValue implements ValueGetter {
    constructor(private value: ComparableValue) {

    }

    getValue(): ComparableValue {
        return this.value;
    }    
}