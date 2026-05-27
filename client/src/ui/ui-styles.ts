import { Depths } from "@shared/enums/Depths.enum.ts"
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
        depth: Depths.First,
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
        depth: Depths.First,
    }
} as Record<string, BarStyleType>;

export const TextStyle = {
    NameTag: {
        fontFamily: "Comic Sans MS",
        color: "white",
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
        width: 280,
        height: 90,
        radius: 12,

        backgroundColor: 0x0c6bb7,
        borderColor: 0x00d4ff,
        borderThickness: 4,

        text: {
            fontFamily: "Arial",
            fontSize: "36px",
            color: "#ffffff",
            fontStyle: "bold"
        }
    },

    ShootButton: {
        width: 280,
        height: 90,
        radius: 12,

        backgroundColor: 0xd62828,
        borderColor: 0xff6b6b,
        borderThickness: 4,

        text: {
            fontFamily: "Arial",
            fontSize: "36px",
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
