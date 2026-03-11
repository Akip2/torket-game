import { Depths } from "@shared/enums/Depths.eunum"
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
        color: "#44ff44",
        fontSize: 32,
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 2
    },

    Timer: {
        fontFamily: "Arial",
        fontSize: 27,
        color: "#ffaa44",
        align: "center",
        fontStyle: "bold"
    }
} as Record<string, Phaser.Types.GameObjects.Text.TextStyle>;

export const ButtonStyle = {
    MoveButton: {
        width: 220,
        height: 70,
        radius: 6,

        backgroundColor: 0x2563eb,
        borderColor: 0xffffff,
        borderThickness: 3,

        text: {
            fontFamily: "Arial",
            fontSize: "32px",
            color: "#ffffff",
            fontStyle: "bold"
        }
    },

    ShootButton: {
        width: 220,
        height: 70,
        radius: 6,

        backgroundColor: 0xc01616,
        borderColor: 0xffffff,
        borderThickness: 3,

        text: {
            fontFamily: "Arial",
            fontSize: "32px",
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
} as Record<string, UIButtonStyle>;
