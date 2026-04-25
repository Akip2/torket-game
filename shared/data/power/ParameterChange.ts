import { PARAM_BASE_VALUE_MAP, PARAM_COEF_TABLE } from "../../const";
import { Parameter } from "../../enums/Parameter.enum";
import type { ParameterChangeCoef } from "../../types";
export default class ParameterChange {
    private text: string;
    private value: number;
    private parameter: Parameter;

    constructor(parameter: Parameter, value: ParameterChangeCoef) {
        this.parameter = parameter;

        if (value < 0) {
            this.text = "-".repeat(Math.abs(value));
        } else {
            this.text = "+".repeat(value);
        }
        this.text += " " + parameter;

        const baseValue = PARAM_BASE_VALUE_MAP.get(parameter)!;
        this.value = baseValue * PARAM_COEF_TABLE[value];
    }

    getParameter() {
        return this.parameter;
    }

    getText() {
        return this.text;
    }

    getValue() {
        return this.value;
    }
}