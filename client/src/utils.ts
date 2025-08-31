import { EXPLOSION_SPRITE_SIZE } from "../../shared/const";

export function getTextWidth(text: string, fontSize: string) {
    return text.length * fontSizeToNumber(fontSize) * 0.7;
}

export function fontSizeToNumber(fontSize: string): number {
    return parseFloat(fontSize.substring(0, fontSize.length - 2));
}

export function getExplosionSpriteScale(explosionRadius: number) {
    return (explosionRadius / EXPLOSION_SPRITE_SIZE) * 1.75;
}