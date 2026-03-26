import type { AvailableRoomData } from "@shared/types";
import type { MapPreviewData } from "@shared/types";
import { GAME_HEIGHT, GAME_WIDTH, MAP_PREVIEW_HEIGHT, MAP_PREVIEW_WIDTH, PLAYER_CONST } from "@shared/const";

export function generateRoomComponent(room: AvailableRoomData) {
    return `
        <tr id='${room.roomId}' data-private=${room.private}>
            <td>${room.metadata.gameName}</td>
            <td>${room.clients} / ${room.maxClients}</td>
            <td>${room.private ? "❌" : "✅"}</td>
        </tr>
        `;
}

export function generateMapCard(mapData: MapPreviewData) {
    const card = document.createElement("div");
    card.className = "map-card";

    const canvas = document.createElement("canvas");
    canvas.className = "map-preview";
    canvas.width = MAP_PREVIEW_WIDTH;
    canvas.height = MAP_PREVIEW_HEIGHT;

    const name = document.createElement("span");
    name.className = "map-name";

    const input = document.createElement("input");
    input.className = "map-id";
    input.type = "hidden";
    input.name = "map-id";

    card.append(canvas, name, input);

    setupMapCard(card, mapData);
    return card;
}

export function setupMapCard(mapCard: Element, mapData: MapPreviewData,) {
    const mapName = mapCard.getElementsByClassName("map-name")[0]!;
    mapName.textContent = mapData.name;

    const mapPreview = mapCard.getElementsByClassName("map-preview")[0]! as HTMLCanvasElement;
    const ctx = mapPreview.getContext("2d")!;

    const { rowSize, columnSize, grid } = mapData.primitive;
    const step = 1;

    const tileW = MAP_PREVIEW_WIDTH / (rowSize / step);
    const tileH = MAP_PREVIEW_HEIGHT / (columnSize / step);

    ctx.clearRect(0, 0, MAP_PREVIEW_WIDTH, MAP_PREVIEW_HEIGHT);
    ctx.fillStyle = "rgb(112, 118, 130)";

    for (let row = 0; row < columnSize; row += step) {
        for (let col = 0; col < rowSize; col += step) {
            if (grid[row * rowSize + col] === 1) ctx.fillRect((col / step) * tileW, (row / step) * tileH, tileW, tileH);
        }
    }

    const mapIdContainer = mapCard.getElementsByClassName("map-id")[0]!;
    (mapIdContainer as HTMLInputElement).value = mapData.id;

    const scaleX = MAP_PREVIEW_WIDTH / GAME_WIDTH;
    const scaleY = MAP_PREVIEW_HEIGHT / GAME_HEIGHT;

    mapData.playerPositions.forEach(pos => {
        ctx.fillStyle = "#" + PLAYER_CONST.SELF_COLOR.toString(16);
        ctx.fillRect(pos.x * scaleX, pos.y * scaleY, 6, 6);
    });
}