import { EXPLOSION_SPRITE_SIZE, EXPLOSION_SPRITE_TO_RADIUS_RATIO } from "./const";

export function getTextWidth(text: string, fontSize: string) {
    return text.length * fontSizeToNumber(fontSize) * 0.7;
}

export function fontSizeToNumber(fontSize: string): number {
    return parseFloat(fontSize.substring(0, fontSize.length - 2));
}

export function getExplosionSpriteScale(explosionRadius: number) {
    const desiredDiameter = explosionRadius * EXPLOSION_SPRITE_TO_RADIUS_RATIO;
    return (desiredDiameter / EXPLOSION_SPRITE_SIZE);
}