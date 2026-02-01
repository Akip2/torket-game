import { Border } from "./enums/Border.enum";
import type { Rectangle } from "./types";

export const DEBUG = false;
export const CLIENT_PREDICTION = false;

export const GAME_WIDTH = 1600;
export const GAME_HEIGHT = 800;
export const GRAVITY = 1.75;

export const TILE_SIZE = 2;
export const EDITION_TILE_SIZE = 8;

export const GROUND_TYPE = "stone";
export const TEXTURE_SIZE = 128;

export const EXPLOSION_SPRITE_SIZE = 32;
export const EXPLOSION_RADIUS = 50;

export const TIME_STEP = 1000 / 60;

export const PLAYER_CONST = {
    WIDTH: 32,
    SPEED: 4.5,
    JUMP: -18,
    MAX_HP: 100,

    SELF_COLOR: 0x3498db,
    ENNEMY_COLOR: 0xdb3445,
}

export const BULLET_CONST = {
    RADIUS: 4,
    AIR_FRICTION: 0.01
}

export const BORDERS_CONST = {
    [Border.Top]: {
        x: GAME_WIDTH / 2,
        y: 0,

        width: GAME_WIDTH,
        height: 1
    },

    [Border.Bottom]: {
        x: GAME_WIDTH / 2,
        y: GAME_HEIGHT,

        width: GAME_WIDTH,
        height: 1
    },

    [Border.Right]: {
        x: GAME_WIDTH,
        y: GAME_HEIGHT / 2,

        width: 1,
        height: GAME_HEIGHT
    },

    [Border.Left]: {
        x: 0,
        y: GAME_HEIGHT / 2,

        width: 1,
        height: GAME_HEIGHT
    },
} as Record<Border, Rectangle>

export const DAMAGE_BASE = 8;
export const BASE_MAX_SHOT_FORCE = 15;
export const MIN_SHOT_FORCE = 2;