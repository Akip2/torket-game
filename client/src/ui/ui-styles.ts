import { Depths } from "@shared/enums/Depths.eunum"

export const ButtonStyle = {
    MainMenu: {
        fontSize: '20px',
        fontFamily: "Verdana",
        color: '#ffffff',
        backgroundColor: 'rgb(121, 85, 72)',
        padding: { y: 10 },
        align: "center",
    }
}

export const BarStyle = {
    Player: {
        mainColor: 0x32CD32,
        backgroundColor: 0xDC143C,

        height: 7.5,
        width: 65,

        marginY: -30,
        marginX: 0,

        opacity: 0.75,
        depth: Depths.Second,
    }
}