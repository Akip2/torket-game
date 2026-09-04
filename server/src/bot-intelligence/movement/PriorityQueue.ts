export default class PriorityQueue<T> {
    private elements: T[];

    constructor(private comparator: (e1: T, e2: T) => number) {
        this.elements = [];
    }

    enqueue(element: T) {
        let i = 0;
        while (
            i < this.elements.length
            &&
            this.comparator(element, this.elements[i]) < 0
        ) {
            i++;
        }

        this.elements.splice(i, 0, element);
    }

    getElement(): T {
        if(this.length > 0) {
            return this.elements.shift()!;
        } else {
            throw new Error("Empty queue");
        }
    }

    get length() {
        return this.elements.length;
    }
}