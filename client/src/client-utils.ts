import { EXPLOSION_SPRITE_SIZE } from "@shared/const";
import { Cursor } from "@shared/enums/Cursor.enum";
import type { AvailableRoomData } from "@shared/types";
import tinycolor from "tinycolor2";

const SERVER_URL: string = import.meta.env.VITE_SERVER_URL || "ws://localhost:2567";
const TRANSFORMED_SERVER_URL = SERVER_URL.replace("ws", "http");

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

export async function getAvailableRooms(): Promise<AvailableRoomData[]> {
    return (await fetch(`${TRANSFORMED_SERVER_URL}/rooms`)).json();
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