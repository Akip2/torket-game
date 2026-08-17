import { BotPerceptionKey } from "@shared/enums/BotPerceptionKey.enum";
import BotPerception from "../../BotPerception";
import { ValueGetter } from "./ValueGetter";

export default class PerceptionValue implements ValueGetter {
    constructor(private botPerception: BotPerception, private perceptionKey: BotPerceptionKey) {

    }

    getValue(): number {
        return this.botPerception[this.perceptionKey];
    }
}