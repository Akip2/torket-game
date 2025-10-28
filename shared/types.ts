export type InputPayload = {
    up: boolean,
    down: boolean,
    right: boolean;
    left: boolean;

    mousePosition: Position,
    
    timeStamp: number;
}

export type ShootInfo = {
    force: number,

    originX: number,
    originY: number,
    
    targetX: number,
    targetY: number
}

export type QuadBlockType = {
    x: number;
    y: number;
    width: number;
    height: number;
    filled: boolean;
    children: QuadBlockType[]
}

export type BarStyleType = {
    mainColor: number;
    backgroundColor: number;

    height: number;
    width: number;

    marginX: number;
    marginY: number;
}

export type GameMap = {
    playerPositions: Position[],
    quadTree: QuadBlockType
}

export type PlayerStartingPosition = {
    x: number,
    y: number,
    playerId?: string
}

export type Position = {
    x: number,
    y: number
}