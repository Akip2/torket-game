import ParameterChange from "./ParameterChange";

export default class Power {
    private name: string;
    private benefits: ParameterChange[];
    private drawbacks: ParameterChange[];

    constructor(name: string, benefits: ParameterChange[], drawbacks: ParameterChange[]) {
        this.name = name;
        this.benefits = benefits;
        this.drawbacks = drawbacks;
    }

    getName() {
        return this.name;
    }

    getBenefits() {
        return this.benefits;
    }

    getDrawbacks() {
        return this.drawbacks;
    }
}