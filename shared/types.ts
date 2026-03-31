import type Phase from "./data/phases/Phase";
import type PrimitiveMap from "./data/PrimitiveMap";
import type { Depths } from "./enums/Depths.eunum";
import type { RequestTypes } from "./enums/RequestTypes.enum";

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
    room?: any;
    messageBuffer?: { type: RequestTypes, data: any }[];
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
    mapId: string;

    playerData: PlayerData;
}

export type AvailableRoomData = {
    clients: number;
    maxClients: number;

    metadata: {
        gameName: "Player's game"
    };

    private: boolean;
    roomId: string;
}

export type MapPreviewData = {
    id: string;
    name: string;
    maxPlayers: number;
    primitive: PrimitiveMap;
    playerPositions: Position[];
}