import { PARAM_BASE_VALUE_MAP } from "../../const";
import { Parameter } from "../../enums/Parameter.enum";
import ParameterChange from "./ParameterChange";
import Power from "./Power";
import { getPower } from "./power-creator";

export default class PowerManager {
    private powers: Power[];
    private parametersValues: Map<Parameter, number>;

    constructor() {
        this.powers = [];
        this.parametersValues = new Map(PARAM_BASE_VALUE_MAP);
    }

    private updateParametersValues(paramChange: ParameterChange) {
        const parameter = paramChange.getParameter();
        const newValue = this.parametersValues.get(parameter)! + paramChange.getValue();
        const minValue = PARAM_BASE_VALUE_MAP.get(parameter)! * 0.1; 

        this.parametersValues.set(parameter, newValue > minValue ? newValue : minValue);
    }

    getParameterValue(parameter: Parameter) {
        return this.parametersValues.get(parameter)!;
    }

    addPower(power: Power) {
        this.powers.push(power);

        power.getBenefits().forEach(benefit => this.updateParametersValues(benefit));
        power.getDrawbacks().forEach(drawback => this.updateParametersValues(drawback));
    }

    addPowerFromName(powerName: string) {
        this.addPower(getPower(powerName));
    }
}