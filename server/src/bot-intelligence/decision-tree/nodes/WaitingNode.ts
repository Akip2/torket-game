import { wait } from "@shared/utils";
import LinearNode from "./LinearNode";

export default class WaitingNode extends LinearNode {
    constructor(private waitingTime: number) {
        super();
    }

    async execute(): Promise<void> {
        await wait(this.waitingTime * 1000);
    }
}