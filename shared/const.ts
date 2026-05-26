import { Border } from "./enums/Border.enum";
import { Parameter } from "./enums/Parameter.enum";
import type { ParameterChangeCoef, Rectangle } from "./types";

export const DEBUG = false;
export const FREE_ROAM = false;
export const CLIENT_PREDICTION = true;

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

    BASE_MAX_MOVEMENT: 100,

    BASE_MASS: 15,

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
    AIR_FRICTION: 0.01,
    GRAVITY_SCALE: 1,
}

export const EXPLOSION_CONST = {
    SPRITE_SIZE: 32,
    BASE_RADIUS: 50,
    BASE_PUSH: 0.8,
}

export const SHOT_CONST = {
    BASE_DAMAGE: 10,
    BASE_MAX_SHOT_FORCE: 20,
    MIN_SHOT_FORCE: 2,
}

const BORDER_SAFE_MARGIN = 200; // increased size to make sure bullet collision detections work
const TOP_OFFSET = 150;

export const BORDERS_CONST = {
    [Border.Top]: {
        x: GAME_WIDTH / 2,
        y: -BORDER_SAFE_MARGIN / 2 - TOP_OFFSET,

        width: GAME_WIDTH,
        height: BORDER_SAFE_MARGIN
    },

    [Border.Bottom]: {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT + BORDER_SAFE_MARGIN / 2,

        width: GAME_WIDTH,
        height: BORDER_SAFE_MARGIN
    },

    [Border.Right]: {
        x: GAME_WIDTH + BORDER_SAFE_MARGIN / 2,
        y: (GAME_HEIGHT - TOP_OFFSET) / 2,

        width: BORDER_SAFE_MARGIN,
        height: GAME_HEIGHT + TOP_OFFSET
    },

    [Border.Left]: {
        x: -BORDER_SAFE_MARGIN / 2,
        y: (GAME_HEIGHT - TOP_OFFSET) / 2,

        width: BORDER_SAFE_MARGIN,
        height: GAME_HEIGHT + TOP_OFFSET
    },
} as Record<Border, Rectangle>;

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