export function parsePlayerLabel(label: string) {
    const argsString = label.split("player:")[1];
    const args = argsString.split(";");

    return {
        sessionId: args[0]
    };
}