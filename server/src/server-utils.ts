export function parsePlayerLabel(label: string) {
    const argsString = label.split("player:")[1];
    const args = argsString.split(";");

    return {
        sessionId: args[0]
    };
}

export function parseMapName(mapName: string) {
    let parsedName = mapName.replaceAll("_", " ");
    parsedName = String(parsedName).charAt(0).toUpperCase() + String(parsedName).slice(1);

    return parsedName;
}