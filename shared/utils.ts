import { BORDER_CONST } from "./const";
import type { Bounds } from "./types";

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

export function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export function generateDefaultRoomName(playerName?: string) {
  return `${cleanPlayerName(playerName)}'s game`;
}

export function cleanPlayerName(playerName?: string) {
  return playerName?.trim().substring(0, 8) || "Player";
}

export function convertMapIdToName(mapId: string) {
  let parsedName = mapId.replaceAll("_", " ");
  parsedName = String(parsedName).charAt(0).toUpperCase() + String(parsedName).slice(1);

  return parsedName;
}

export function generateBorderData(bounds: Bounds) {
  const mapWidth = bounds.x.max - bounds.x.min;
  const mapHeight = bounds.y.max - bounds.y.min;

  const totalWidth =
    mapWidth + BORDER_CONST.HORIZONTAL_OFFSET * 2;

  const totalHeight =
    mapHeight +
    BORDER_CONST.UP_OFFSET +
    BORDER_CONST.DOWN_OFFSET;

  const centerX =
    (bounds.x.min + bounds.x.max) / 2;

  const verticalCenter =
    (
      bounds.y.min -
      BORDER_CONST.UP_OFFSET +
      bounds.y.max +
      BORDER_CONST.DOWN_OFFSET
    ) / 2;

  return [
    // LEFT
    {
      x: bounds.x.min - BORDER_CONST.HORIZONTAL_OFFSET,
      y: verticalCenter,
      width: BORDER_CONST.THICKNESS,
      height: totalHeight,
    },

    // RIGHT
    {
      x: bounds.x.max + BORDER_CONST.HORIZONTAL_OFFSET,
      y: verticalCenter,
      width: BORDER_CONST.THICKNESS,
      height: totalHeight,
    },

    // TOP
    {
      x: centerX,
      y: bounds.y.min - BORDER_CONST.UP_OFFSET,
      width: totalWidth,
      height: BORDER_CONST.THICKNESS,
    },

    // BOTTOM
    {
      x: centerX,
      y: bounds.y.max + BORDER_CONST.DOWN_OFFSET,
      width: totalWidth,
      height: BORDER_CONST.THICKNESS,
    },
  ];
}