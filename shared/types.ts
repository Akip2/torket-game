export type InputPayload = {
    up: boolean,
    down: boolean,
    right: boolean;
    left: boolean;

    mousePosition: {
        x: number,
        y: number
    },
    
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