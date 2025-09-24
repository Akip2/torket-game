import { EXPLOSION_SPRITE_SIZE } from "./const";

export function getTextWidth(text: string, fontSize: string) {
    return text.length * fontSizeToNumber(fontSize) * 0.7;
}

export function fontSizeToNumber(fontSize: string): number {
    return parseFloat(fontSize.substring(0, fontSize.length - 2));
}

export function getExplosionSpriteScale(explosionRadius: number) {
    return (explosionRadius / EXPLOSION_SPRITE_SIZE) * 1.75;
}

export function parsePlayerLabel(label: string) {
    const argsString = label.split("player:")[1];
    const args = argsString.split(";");

    return {
        sessionId: args[0]
    };
}

export function circleIntersectsRectangle(
  cx: number, cy: number, radius: number,
  rx: number, ry: number, rw: number, rh: number
): boolean {
  const closestX = Math.max(rx, Math.min(cx, rx + rw));
  const closestY = Math.max(ry, Math.min(cy, ry + rh));

  const dx = cx - closestX;
  const dy = cy - closestY;

  return (dx * dx + dy * dy) <= (radius * radius);
}