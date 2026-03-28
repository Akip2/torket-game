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