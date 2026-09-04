import { PLAYER_CONST } from "@shared/const";
import { Action } from "@shared/enums/Action.enum";
import { Depths } from "../enums/Depths.enum"
import type { BarStyleType, UIButtonStyle } from "@shared/types";

export const BarStyle = {
    Health: {
        mainColor: 0x4ade80,
        backgroundColor: 0x1a0a0a,
        borderColor: 0x2d2d2d,

        height: 8,
        width: 65,
        marginY: -32,
        marginX: 0,
        opacity: 0.85,
        depth: Depths.PlayerUi,
    },

    Movement: {
        mainColor: 0x38bdf8,
        backgroundColor: 0x0a0f1a,
        borderColor: 0x1e3a5f,

        height: 6,
        width: 65,
        marginY: -23.5,
        marginX: 0,
        opacity: 0.85,
        depth: Depths.PlayerUi,
    }
} as Record<string, BarStyleType>;

export const TextStyle = {
    NameTag: {
        fontFamily: "Comic Sans MS",
        color: "white",
    },

    PlayerFace: {
        color: "black",
        fontFamily: "JetBrainsMono",
        fontSize: Math.round(PLAYER_CONST.BASE_WIDTH / 2),
        letterSpacing: -1.25,
        fixedWidth: PLAYER_CONST.BASE_WIDTH,
        align: "center"
    },

    PhaseDisplayer: {
        fontFamily: "Arial",
        color: "#e3f6fd",
        fontSize: 20,
        fontStyle: "bold",
        stroke: "#091e2b",
        strokeThickness: 2
    },

    Timer: {
        fontFamily: "Arial",
        fontSize: 18,
        color: "#ffe9b5",
        align: "center",
        fontStyle: "bold"
    }
} as Record<string, Phaser.Types.GameObjects.Text.TextStyle>;

export const ButtonStyle = {
    MoveButton: {
        width: 220,
        height: 90,
        radius: 12,
        backgroundColor: 0x0c6bb7,
        borderColor: 0x00d4ff,
        borderThickness: 4,
        text: {
            fontFamily: "Arial",
            fontSize: "28px",  // réduit de 36px
            color: "#ffffff",
            fontStyle: "bold"
        }
    },

    ShootButton: {
        width: 220,
        height: 90,
        radius: 12,
        backgroundColor: 0xd62828,
        borderColor: 0xff6b6b,
        borderThickness: 4,
        text: {
            fontFamily: "Arial",
            fontSize: "28px",
            color: "#ffffff",
            fontStyle: "bold"
        }
    },

    ReloadButton: {
        width: 220,
        height: 90,
        radius: 12,
        backgroundColor: 0xb86b00,
        borderColor: 0xffb52e,
        borderThickness: 4,
        text: {
            fontFamily: "Arial",
            fontSize: "28px",
            color: "#ffffff",
            fontStyle: "bold"
        }
    },

    EndTurnButton: {
        width: 100,
        height: 30,
        backgroundColor: 0x1e40af,
        borderColor: 0x60a5fa,
        borderThickness: 2,
        text: {
            fontFamily: "Arial",
            fontSize: "16px",
            color: "#ffffff",
            fontStyle: "bold",
        },
    },

    GameEndButton: {
        width: 200,
        height: 60,
        radius: 6,

        backgroundColor: 0x1e40af,
        borderColor: 0x60a5fa,
        borderThickness: 3,

        text: {
            fontFamily: "Arial",
            fontSize: "24px",
            color: "#ffffff",
            fontStyle: "bold"
        }
    },
} as Record<string, UIButtonStyle>;

export const ACTION_TO_STYLE = {
    [Action.Move]: ButtonStyle.MoveButton,
    [Action.Shoot]: ButtonStyle.ShootButton,
    [Action.Reload]: ButtonStyle.ReloadButton,
}