import { BOT_ID } from "@shared/const";

export function parsePlayerLabel(label: string) {
    const argsString = label.split("player:")[1];
    const args = argsString.split(";");

    return {
        sessionId: args[0]
    };
}
export function isBotId(sessionId: string) {
    return sessionId === BOT_ID;
}