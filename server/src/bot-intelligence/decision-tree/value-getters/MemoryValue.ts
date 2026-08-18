import { ValueGetter } from "./ValueGetter";
import { BotMemoryKey } from "@shared/enums/BotMemoryKey.enum";
import BotMemory from "../../BotMemory";
import { ComparableValue } from "@shared/types";

export default class MemoryValue implements ValueGetter {
    constructor(private botMemory: BotMemory, private memoryKey: BotMemoryKey) {

    }

    getNestedValue(obj: unknown, path: string): unknown {
        return path.split(".").reduce(
            (o, k) => (o as Record<string, unknown>)[k],
            obj
        );
    }

    getValue(): ComparableValue {
        return this.getNestedValue(this.botMemory, this.memoryKey) as ComparableValue;
    }
}