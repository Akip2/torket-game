import { ComparableValue } from "@shared/types";

export interface ValueGetter {
    getValue(): ComparableValue;
}