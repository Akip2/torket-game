import { ValueGetter } from "./ValueGetter";

export default class StaticValue implements ValueGetter {
    constructor(private value: number) {

    }

    getValue(): number {
        return this.value;
    }    
}