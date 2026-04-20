import { Parameter } from "../../enums/Parameter.enum";
import ParameterChange from "./ParameterChange";
import Power from "./Power";

const powerMap = new Map<string, Power>();
const powers: Power[] = [];

function addPower(power: Power) {
    powerMap.set(power.getName(), power);
    powers.push(power);
}

export function getPower(name: string) {
    return powerMap.get(name)!;
}

export function getRandomPowers(count: number = 3) {
    const powerCopy = powers.slice();

    const res = [];
    for (let i = 0; i < count; i++) {
        const index = Math.random() * powerCopy.length;
        res.push(powerCopy.splice(index));
    }

    return res;
}

// TANK
addPower(new Power(
    "Tank",
    [
        new ParameterChange(Parameter.Hp, 3),
        new ParameterChange(Parameter.Hp, 3),
    ],
    [
        new ParameterChange(Parameter.Size, 2),
        new ParameterChange(Parameter.Movement, -1),
    ]
));

// MADE OF STEEL
addPower(new Power(
    "Made of steel",
    [
        new ParameterChange(Parameter.Weight, 3),
    ],
    [
        new ParameterChange(Parameter.Movement, -2),
    ]
));

// ACROBAT
addPower(new Power(
    "Acrobat",
    [
        new ParameterChange(Parameter.Size, -1),
        new ParameterChange(Parameter.Movement, 2),
    ],
    [
        new ParameterChange(Parameter.Weight, -2),
    ]
));

// TINY
addPower(new Power(
    "Tiny",
    [
        new ParameterChange(Parameter.Size, -3),
        new ParameterChange(Parameter.Movement, 1),
    ],
    [
        new ParameterChange(Parameter.Hp, -2),
        new ParameterChange(Parameter.Damage, -2),
    ]
));

// BOMBER
addPower(new Power(
    "Bomber",
    [
        new ParameterChange(Parameter.ExpSize, 2),
        new ParameterChange(Parameter.ExpPush, 1),
    ],
    [
        new ParameterChange(Parameter.Hp, -1),
        new ParameterChange(Parameter.Damage, -1),
    ]
));

// SHOCKWAVE
addPower(new Power(
    "Shockwave",
    [
        new ParameterChange(Parameter.ExpPush, 3),
    ],
    [
        new ParameterChange(Parameter.Damage, -2),
    ]
));

// SNIPER
addPower(new Power(
    "Sniper",
    [
        new ParameterChange(Parameter.Range, 2),
        new ParameterChange(Parameter.Damage, 2),
    ],
    [
        new ParameterChange(Parameter.ExpSize, -2),
        new ParameterChange(Parameter.ExpPush, -1),
    ]
));

// GLASS CANNON
addPower(new Power(
    "Glass cannon",
    [
        new ParameterChange(Parameter.Size, -1),
        new ParameterChange(Parameter.Damage, 3),
    ],
    [
        new ParameterChange(Parameter.Hp, -3),
    ]
));

// STABLE SHOT
addPower(new Power(
    "Stable shot",
    [
        new ParameterChange(Parameter.Hp, 2),
        new ParameterChange(Parameter.Damage, 2),
    ],
    [
        new ParameterChange(Parameter.ExpPush, -2),
        new ParameterChange(Parameter.ExpSize, -1),
    ]
));

// KAMIKAZE
addPower(new Power(
    "Kamikaze",
    [
        new ParameterChange(Parameter.ExpSize, 2),
        new ParameterChange(Parameter.Damage, 1),
    ],
    [
        new ParameterChange(Parameter.Size, 1),
        new ParameterChange(Parameter.Hp, -1),
    ]
));

// FATSO
addPower(new Power(
    "Fatso",
    [
        new ParameterChange(Parameter.Hp, 2),
        new ParameterChange(Parameter.Weight, 3),
    ],
    [
        new ParameterChange(Parameter.Size, 3),
        new ParameterChange(Parameter.Movement, -1),
    ]
));

// LONG RANGE
addPower(new Power(
    "Long range",
    [
        new ParameterChange(Parameter.Range, 3),
    ],
    [
        new ParameterChange(Parameter.Damage, -2),
    ]
));

// CLOSE COMBAT
addPower(new Power(
    "Close combat",
    [
        new ParameterChange(Parameter.Weight, 1),
        new ParameterChange(Parameter.Damage, 3),
    ],
    [
        new ParameterChange(Parameter.Range, -3),
    ]
));

// RUNNER
addPower(new Power(
    "Runner",
    [
        new ParameterChange(Parameter.Movement, 3),
    ],
    [
        new ParameterChange(Parameter.Weight, -3),
    ]
));

// PUSHER
addPower(new Power(
    "Pusher",
    [
        new ParameterChange(Parameter.ExpPush, 3),
    ],
    [
        new ParameterChange(Parameter.Range, -1),
        new ParameterChange(Parameter.Damage, -1),
    ]
));

// KABOOM
addPower(new Power(
    "Kaboom",
    [
        new ParameterChange(Parameter.ExpSize, 3),
    ],
    [
        new ParameterChange(Parameter.Damage, -2),
    ]
));

// PRECISE SHOT
addPower(new Power(
    "Precise shot",
    [
        new ParameterChange(Parameter.Range, 2),
        new ParameterChange(Parameter.Damage, 1),
    ],
    [
        new ParameterChange(Parameter.ExpSize, -2),
    ]
));