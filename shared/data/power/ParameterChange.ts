import { EXPLOSION_CONST, PLAYER_CONST, SHOT_CONST } from "../../const";
import { Parameter } from "../../enums/Parameter.enum";
import { ParameterChangeCoef } from "../../types";

const COEF_MAP = {
    [-3]: -0.5,
    [-2]: -0.25,
    [-1]: -0.10,

    [1]: 0.10,
    [2]: 0.25,
    [3]: 0.5,
} as Record<ParameterChangeCoef, number>;

const BASE_VALUE_MAP = {
    [Parameter.Damage]: SHOT_CONST.BASE_DAMAGE,
    [Parameter.ExpSize]: EXPLOSION_CONST.BASE_RADIUS,
    [Parameter.ExpPush]: EXPLOSION_CONST.BASE_PUSH,
    [Parameter.Hp]: PLAYER_CONST.BASE_MAX_HP,
    [Parameter.Movement]: PLAYER_CONST.BASE_MAX_MOVEMENT,
    [Parameter.Size]: PLAYER_CONST.BASE_WIDTH,
    [Parameter.Range]: SHOT_CONST.BASE_MAX_SHOT_FORCE,
    [Parameter.Weight]: PLAYER_CONST.BASE_MASS
} as Record<Parameter, number>;

export default class ParameterChange {
    private text: string;
    private value: number;

    constructor(parameter: Parameter, value: ParameterChangeCoef) {
        if (value < 0) {
            this.text = "-".repeat(Math.abs(value));
        } else {
            this.text = "+".repeat(value);
        }

        const baseValue = BASE_VALUE_MAP[parameter];
        this.value = baseValue * COEF_MAP[value];
    }

    getText() {
        return this.text;
    }

    getValue() {
        return this.value;
    }
}