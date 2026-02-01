import { EXPLOSION_SPRITE_SIZE } from "@shared/const";
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