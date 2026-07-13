import { FaceExpression } from "./enums/FaceExpression.enum";
import { Parameter } from "./enums/Parameter.enum";
import type { ParameterChangeCoef } from "./types";

export const DEBUG = false;
export const FREE_ROAM = false;
export const CLIENT_PREDICTION = false;

export const DEFAULT_MAP_ID = "mirrorhold";

// Client prediction & interpolation settings
export const INTERPOLATION_SPEED_X = 0.4; // Time-based lerp factor (0.4 = faster catch-up)
export const INTERPOLATION_SPEED_Y = 0.5; // Vertical is more important for feel (gravity, jumps)
export const MAX_PREDICTED_DISTANCE = 15; // Max pixels before forcing position (collision detection)
export const NETWORK_TICK_RATE = 1000 / 30; // 30 Hz network sync

export const GAME_WIDTH = 1600;
export const GAME_HEIGHT = 800;
export const GRAVITY = 1.75;

export const TILE_SIZE = 2;
export const EDITION_TILE_SIZE = 8;

export const GROUND_TYPE = "stone";
export const TEXTURE_SIZE = 128;

export const TIME_STEP = 1000 / 60;

export const HEALTH_TRANSITION_DURATION = 400;

export const PLAYER_CONST = {
    BASE_WIDTH: 32,
    SPEED: 4.5,
    JUMP: -18,
    BASE_MAX_HP: 100,

    SELF_COLOR: 0x3498db,
    ENNEMY_COLOR: 0xdb3445,

    BASE_MAX_MOVEMENT: FREE_ROAM ? Number.MAX_VALUE : 165,

    BASE_MASS: 26,

    BASE_FACE: FaceExpression.Shocked,

    BASE_FRICTION: {
        FRICTION: 0,
        FRICTION_STATIC: 0,
        FRICTION_AIR: 0.05,
    },

    PUSH_FRICTION: {
        FRICTION: 1,
        FRICTION_STATIC: 0,
        FRICTION_AIR: 0.5,
    },

    EXPLODED_FRICTION: {
        FRICTION: 0,
        FRICTION_STATIC: 0,
        FRICTION_AIR: 0.05,
    },
}

export const BULLET_CONST = {
    RADIUS: 4,
    TRAIL_DISTANCE: 2,
    TRAIL_COLOR: 0xff2222,
    AIR_FRICTION: 0.01,
    GRAVITY_SCALE: 1,
}

export const CAPTURE_POINT_CONST = {
    RADIUS: 16,
    BASE_COLOR: 0xD3D3D3,
    SELF_COLOR: PLAYER_CONST.SELF_COLOR,
    ENNEMY_COLOR: PLAYER_CONST.ENNEMY_COLOR,
}

export const EXPLOSION_CONST = {
    SPRITE_SIZE: 32,
    BASE_RADIUS: 65,
    BASE_PUSH: 1,
}

export const SHOT_CONST = {
    BASE_DAMAGE: 20,
    BASE_MAX_SHOT_FORCE: 27.5,
    MIN_SHOT_FORCE: 5,
}

export const BORDER_CONST = {
    THICKNESS: 30,
    UP_OFFSET: 1000,
    DOWN_OFFSET: 30,
    HORIZONTAL_OFFSET: 400,
}

export const PARAM_COEF_TABLE = { [-3]: -0.6, [-2]: -0.4, [-1]: -0.2, [1]: 0.2, [2]: 0.4, [3]: 0.6, } as Record<ParameterChangeCoef, number>;

export const PARAM_BASE_VALUE_MAP = new Map<Parameter, number>([
    [Parameter.Damage, SHOT_CONST.BASE_DAMAGE],
    [Parameter.ExpSize, EXPLOSION_CONST.BASE_RADIUS],
    [Parameter.ExpPush, EXPLOSION_CONST.BASE_PUSH],
    [Parameter.Hp, PLAYER_CONST.BASE_MAX_HP],
    [Parameter.Movement, PLAYER_CONST.BASE_MAX_MOVEMENT],
    [Parameter.Size, PLAYER_CONST.BASE_WIDTH],
    [Parameter.Range, SHOT_CONST.BASE_MAX_SHOT_FORCE],
    [Parameter.Weight, PLAYER_CONST.BASE_MASS],
]);

export const MAP_PREVIEW_WIDTH = 300;
export const MAP_PREVIEW_HEIGHT = 150;
export const HUD_HEIGHT = 42;