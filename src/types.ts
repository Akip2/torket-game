export type QuadBlock = {
    x: number;
    y: number;
    width: number;
    height: number;
    filled: boolean;
    children?: QuadBlock[];
};