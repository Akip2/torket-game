export type InputPayload = {
    up: boolean,
    down: boolean,
    right: boolean;
    left: boolean;
    timeStamp: number;
}

export type ShootInfo = {
    force: number,
    x: number,
    y: number
}

export type QuadBlockType = {
    x: number;
    y: number;
    width: number;
    height: number;
    filled: boolean;
    children: QuadBlockType[]
}