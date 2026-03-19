import type Phase from "./data/phases/Phase";
import type { Depths } from "./enums/Depths.eunum";

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

export type FullSynchroInfo = {
    terrain: QuadBlockType,
    phase: Phase
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
    borderColor: number;

    height: number;
    width: number;

    marginX: number;
    marginY: number;

    opacity?: number;
    depth?: Depths;
}

type PrimitiveTextStyle = {
    fontFamily?: string;
    fontSize?: number | string;
    fontStyle?: string;
    font?: string;
    backgroundColor?: string;
    color?: string | CanvasGradient | CanvasPattern;
};

export type UIButtonStyle = {
    width: number;
    height: number;
    radius?: number;

    backgroundColor: number;
    borderColor?: number;
    borderThickness?: number;

    text: PrimitiveTextStyle;
};

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

export type Rectangle = {
    x: number,
    y: number,
    width: number,
    height: number
}

export type InitData = {
    playerData: PlayerData;
    roomData?: RoomData;
}

export type PlayerData = {
    name: string;
}

export type RoomData = {
    creating: boolean;

    roomCreation?: RoomCreationData;
    roomJoining?: RoomJoiningData;
}

export type RoomCreationData = {
    gameName: string;
    password?: string;
}

export type RoomJoiningData = {
    gameId: string;
    password?: string;
}

export type RoomJoinOptions = {
    password?: string;
    playerData: PlayerData;
}

export type RoomCreationOptions = {
    gameName: string;
    password?: string;

    playerData: PlayerData;
}