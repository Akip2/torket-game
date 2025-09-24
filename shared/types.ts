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