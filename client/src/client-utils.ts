import { EXPLOSION_SPRITE_SIZE } from "@shared/const";
import { Cursor } from "@shared/enums/Cursor.enum";
import tinycolor from "tinycolor2";

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
    clearPrimaryDomUi();
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