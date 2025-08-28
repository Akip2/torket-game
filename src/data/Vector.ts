export default class Vector {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getNorm() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    getNormalizedVector() {
        const norm = this.getNorm();

        return new Vector(
            this.x / norm,
            this.y / norm
        );
    }
}