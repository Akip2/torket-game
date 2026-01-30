import { Depths } from "@shared/enums/Depths.eunum"
import type { UIButtonStyle } from "@shared/types";

export const BarStyle = {
    Player: {
        mainColor: 0x32CD32,
        backgroundColor: 0xDC143C,

        height: 7.5,
        width: 65,

        marginY: -30,
        marginX: 0,

        opacity: 0.75,
        depth: Depths.First,
    }
}

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
    }

} as Record<string, UIButtonStyle>;
