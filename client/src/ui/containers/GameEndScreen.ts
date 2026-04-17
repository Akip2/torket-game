import { Depths } from "@shared/enums/Depths.enum.ts";
import { SceneNames } from "@shared/enums/SceneNames.enum";
import type GameScene from "../../scenes/GameScene";
import { wait } from "@shared/utils";
import { showToast } from "../../client-utils";
import UiButton from "../buttons/UiButton";
import { ButtonStyle } from "../ui-styles";
import { ServerError } from "colyseus.js";
import RoomManager from "../../managers/RoomManager";

export type GameEndScreenConfig = {
    isWin: boolean;
    winnerName?: string;
};

export default class GameEndScreen extends Phaser.GameObjects.Container {
    background: Phaser.GameObjects.Rectangle;
    messageText: Phaser.GameObjects.Text;
    detailText: Phaser.GameObjects.Text;

    constructor(scene: GameScene) {
        super(scene, 0, 0);

        scene.uiContainer.add(this);
        this.setDepth(Depths.First + 1);
        this.setScrollFactor(0);

        this.background = scene.add.rectangle(
            scene.cameras.main.centerX,
            scene.cameras.main.centerY,
            scene.cameras.main.width,
            scene.cameras.main.height,
            0x000000,
            0.825
        );
        this.background.setOrigin(0.5);
        this.add(this.background);

        // Message principal (vide au départ)
        this.messageText = scene.add.text(
            scene.cameras.main.centerX,
            scene.cameras.main.centerY - 60,
            "",
            {
                fontSize: "64px",
                color: "#ffffff",
                fontStyle: "bold",
                fontFamily: "Arial",
            }
        );
        this.messageText.setOrigin(0.5);
        this.add(this.messageText);

        // Détail (vide)
        this.detailText = scene.add.text(
            scene.cameras.main.centerX,
            scene.cameras.main.centerY + 40,
            "",
            {
                fontSize: "24px",
                color: "#ffffff",
                fontFamily: "Arial",
            }
        );
        this.detailText.setOrigin(0.5);
        this.add(this.detailText);

        // Boutons (inchangés)
        const backButton = new UiButton(
            scene,
            scene.cameras.main.centerX - 120,
            scene.cameras.main.centerY + 130,
            "BACK TO MENU",
            () => {
                scene.scene.start(SceneNames.TitleScreen);
            },
            ButtonStyle.GameEndButton
        );
        this.add(backButton);

        const playAgainButton = new UiButton(
            scene,
            scene.cameras.main.centerX + 120,
            scene.cameras.main.centerY + 130,
            "PLAY AGAIN",
            () => {
                this.playAgain(scene);
            },
            ButtonStyle.GameEndButton
        );
        this.add(playAgainButton);

        this.alpha = 0;
    }

    setConfig(config: GameEndScreenConfig) {
        const messageColor = config.isWin ? "#00ff00" : "#ff0000";
        const messageText = config.isWin ? "VICTORY !" : "DEFEAT !";

        this.messageText.setText(messageText);
        this.messageText.setColor(messageColor);

        const detailTextContent = config.isWin
            ? `Congratulations ${config.winnerName}!`
            : `${config.winnerName} won the game...`;

        this.detailText.setText(detailTextContent);
    }

    private async playAgain(scene: GameScene) {
        try {
            // Buffer critical messages
            const messageBuffer = await RoomManager.quickPlay(scene.playerData.name);

            // Start a new game
            scene.scene.start(SceneNames.Game, {
                playerData: { name: scene.playerData.name },
                messageBuffer
            });
        } catch (e: any) {
            const serverError = e as ServerError;
            showToast(serverError.message || "Failed to join a room.");
        }
    }

    async appear(scene: GameScene) {
        this.alpha = 0;

        await wait(1200);

        scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 500,
            ease: "Power2.easeOut",
        });
    }
}
