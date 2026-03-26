import { EXPLOSION_SPRITE_SIZE, GAME_HEIGHT, GAME_WIDTH, MAP_PREVIEW_HEIGHT, MAP_PREVIEW_WIDTH, PLAYER_CONST } from "@shared/const";
import { Cursor } from "@shared/enums/Cursor.enum";
import type { MapPreviewData } from "@shared/types";
import tinycolor from "tinycolor2";

const SERVER_URL: string = import.meta.env.VITE_SERVER_URL || "ws://localhost:2567";

export function lightenHexColor(hex: number, coef: number = 7.5) {
    return parseInt(tinycolor(hex.toString(16)).lighten(coef).toHexString().replace("#", ""), 16);
}

export function darkenHexColor(hex: number, coef: number = 7.5) {
    return parseInt(tinycolor(hex.toString(16)).darken(coef).toHexString().replace("#", ""), 16);
}

export function getExplosionSpriteScale(explosionRadius: number) {
    return (explosionRadius / EXPLOSION_SPRITE_SIZE) * 1.75;
}

export function setCursor(
    cursor: Cursor,
    hotspotX: number = 16,
    hotspotY: number = 16
) {
    const canvas = document.getElementById("game-container")!;

    if (cursor === Cursor.Default) {
        canvas.style.cursor = "default";
    } else {
        canvas.style.cursor = `url(assets/cursors/${cursor}.png) ${hotspotX} ${hotspotY}, crosshair`;
    }
}

export function clearDomUi() {
    clearPrimaryDomUi();
    clearSecondaryUiRoot();
}

export function clearSecondaryUiRoot() {
    getSecondaryUiRoot().innerHTML = "";
}

export function clearPrimaryDomUi() {
    getPrimaryUiRoot().innerHTML = "";
}

export function getPrimaryUiRoot() {
    return document.getElementById("ui-container")!;
}

export function getSecondaryUiRoot() {
    return document.getElementById("secondary-ui-container")!;
}

export function getCloseButton(index: number = 0) {
    return document.getElementsByClassName("close-btn")[index];
}

export function getServerUrl() {
    return SERVER_URL;
}

export function showToast(message: string) {
    document.getElementById("toast")?.remove();

    const toast = document.createElement("div");
    toast.id = "toast";
    toast.textContent = message;
    toast.classList.add("toast");

    document.body.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("toast--visible"));

    setTimeout(() => {
        toast.classList.remove("toast--visible");
        toast.addEventListener("transitionend", () => toast.remove());
    }, 1000);
}

export function mountWithTransition(root: HTMLElement, html: string) {
    root.innerHTML = html;
    const popup = root.querySelector(".central-container");
    if (!popup) return;

    requestAnimationFrame(() => popup.classList.add("popup--visible"));
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
    if (mapIdContainer instanceof HTMLInputElement) {
        (mapIdContainer as HTMLInputElement).value = mapData.id;
    } else {
        mapIdContainer.textContent = mapData.id;
    }

    const scaleX = MAP_PREVIEW_WIDTH / GAME_WIDTH;
    const scaleY = MAP_PREVIEW_HEIGHT / GAME_HEIGHT;

    mapData.playerPositions.forEach(pos => {
        ctx.fillStyle = "#" + PLAYER_CONST.SELF_COLOR.toString(16);
        ctx.fillRect(pos.x * scaleX , pos.y * scaleY, 6, 6);
    });
}