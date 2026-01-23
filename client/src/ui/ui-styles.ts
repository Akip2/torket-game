import { Depths } from "@shared/enums/Depths.eunum"

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
        color: "white",
        fontSize: 30
    }
} as Record<string, Phaser.Types.GameObjects.Text.TextStyle>; 