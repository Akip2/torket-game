import type { AvailableRoomData } from "@shared/types";
import type { MapPreviewData } from "@shared/types";
import { EDITION_TILE_SIZE, MAP_PREVIEW_HEIGHT, MAP_PREVIEW_WIDTH, PLAYER_CONST } from "@shared/const";
import { convertMapIdToName } from "@shared/utils";

export function generateRoomComponent(room: AvailableRoomData) {
    return `
        <tr id='${room.roomId}' data-private=${room.private}>
            <td>${room.metadata.gameName}</td>
            <td>${room.clients} / ${room.maxClients}</td>
            <td>${room.private ? "❌" : "✅"}</td>
            <td>${convertMapIdToName(room.metadata.mapId)}</td>
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

export function setupMapCard(mapCard: Element, mapData: MapPreviewData) {
    const mapName = mapCard.getElementsByClassName("map-name")[0]!;
    mapName.textContent = mapData.name;

    const mapPreview = mapCard.getElementsByClassName("map-preview")[0]! as HTMLCanvasElement;
    const ctx = mapPreview.getContext("2d")!;

    const { rowSize, columnSize, grid } = mapData.primitive;

    const mapWidth = mapData.bounds.x.max - mapData.bounds.x.min;
    const mapHeight = mapData.bounds.y.max - mapData.bounds.y.min;

    const scale = Math.min(
        MAP_PREVIEW_WIDTH / mapWidth,
        MAP_PREVIEW_HEIGHT / mapHeight
    );

    const offsetX = (MAP_PREVIEW_WIDTH - mapWidth * scale) / 2;
    const offsetY = MAP_PREVIEW_HEIGHT - mapHeight * scale;

    const tileSize = EDITION_TILE_SIZE * scale;

    ctx.clearRect(0, 0, MAP_PREVIEW_WIDTH, MAP_PREVIEW_HEIGHT);
    ctx.fillStyle = "rgb(112, 118, 130)";

    for (let row = 0; row < columnSize; row++) {
        for (let col = 0; col < rowSize; col++) {
            if (grid[row * rowSize + col] !== 1) continue;

            const worldX = mapData.bounds.x.min + col * EDITION_TILE_SIZE;
            const worldY = mapData.bounds.y.min + row * EDITION_TILE_SIZE;

            ctx.fillRect(
                offsetX + (worldX - mapData.bounds.x.min) * scale,
                offsetY + (worldY - mapData.bounds.y.min) * scale,
                tileSize,
                tileSize
            );
        }
    }

    ctx.fillStyle = "#" + PLAYER_CONST.SELF_COLOR.toString(16);

    for (const pos of mapData.playerPositions) {
        ctx.fillRect(
            offsetX + (pos.x - mapData.bounds.x.min) * scale,
            offsetY + (pos.y - mapData.bounds.y.min) * scale,
            Math.max(4, PLAYER_CONST.BASE_WIDTH * scale),
            Math.max(4, PLAYER_CONST.BASE_WIDTH * scale)
        );
    }

    const mapIdContainer = mapCard.getElementsByClassName("map-id")[0]!;
    (mapIdContainer as HTMLInputElement).value = mapData.id;
}