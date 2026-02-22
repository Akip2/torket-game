import { Border } from "./enums/Border.enum";
import type { Rectangle } from "./types";

export const DEBUG = false;
export const FREE_ROAM = true;
export const CLIENT_PREDICTION = true;

// Client prediction & interpolation settings
export const INTERPOLATION_SPEED = 0.4; // Time-based lerp factor (0.4 = faster catch-up)
export const INTERPOLATION_SPEED_Y = 0.5; // Vertical is more important for feel (gravity, jumps)
export const MAX_PREDICTED_DISTANCE = 15; // Max pixels before forcing position (collision detection)
export const NETWORK_TICK_RATE = 1000 / 60; // 60 Hz network sync

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

const BORDER_SAFE_MARGIN = 200; // increased size to make sure bullet collision detections work
export const BORDERS_CONST = {
    [Border.Top]: {
        x: GAME_WIDTH / 2,
        y: -BORDER_SAFE_MARGIN / 2,

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
        y: GAME_HEIGHT / 2,

        width: BORDER_SAFE_MARGIN,
        height: GAME_HEIGHT
    },

    [Border.Left]: {
        x: - BORDER_SAFE_MARGIN / 2,
        y: GAME_HEIGHT / 2,

        width: BORDER_SAFE_MARGIN,
        height: GAME_HEIGHT
    },
} as Record<Border, Rectangle>

export const DAMAGE_BASE = 8;
export const BASE_MAX_SHOT_FORCE = 15;
export const MIN_SHOT_FORCE = 2;