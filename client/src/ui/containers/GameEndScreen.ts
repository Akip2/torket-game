import { Depths } from "@shared/enums/Depths.enum.ts";
import { SceneNames } from "@shared/enums/SceneNames.enum";
import type GameScene from "../../scenes/GameScene";
import { wait } from "@shared/utils";
import { showToast } from "../../client-utils";
import UiButton from "../buttons/UiButton";
import { ButtonStyle } from "../ui-styles";
import { ServerError } from "colyseus.js";
import RoomManager from "../../managers/RoomManager";
import type { WinCondition } from "@shared/enums/WinCondition.enum";

export type GameEndScreenConfig = {
    isWin: boolean;
    winnerNames?: string[];
    winCondition: WinCondition;
};

function convertToSecondPerso(winCondition: WinCondition) {
    return winCondition.replaceAll("their", "your");
}

export default class GameEndScreen extends Phaser.GameObjects.Container {
    background: Phaser.GameObjects.Rectangle;
    messageText: Phaser.GameObjects.Text;
    detailText: Phaser.GameObjects.Text;

    constructor(scene: GameScene) {
        super(scene, 0, 0);

        scene.uiContainer.add(this);
        this.setDepth(Depths.First + 1);
        this.setScrollFactor(0);

        const viewportCenter = scene.cameraManager.getUiViewportCenter();
        const viewportWidth = scene.cameraManager.getUiViewportWidth();
        const viewportHeight = scene.cameraManager.getUiViewportHeight();

        this.background = scene.add.rectangle(
            viewportCenter.x,
            viewportCenter.y,
            viewportWidth,
            viewportHeight,
            0x000000,
            0.825
        );
        this.background.setOrigin(0.5);
        this.add(this.background);

        // Message principal (vide au départ)
        this.messageText = scene.add.text(
            viewportCenter.x,
            viewportCenter.y - 60,
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
            viewportCenter.x,
            viewportCenter.y + 40,
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
            viewportCenter.x - 120,
            viewportCenter.y + 130,
            "BACK TO MENU",
            () => {
                scene.scene.stop(SceneNames.Game);
                scene.scene.start(SceneNames.TitleScreen);
            },
            ButtonStyle.GameEndButton
        );
        
        this.add(backButton);

        const playAgainButton = new UiButton(
            scene,
            viewportCenter.x + 120,
            viewportCenter.y + 130,
            "PLAY AGAIN",
            () => {
                playAgainButton.disable();
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

        const winners = config.winnerNames?.join(" and ");

        const detailTextContent = config.isWin
            ? `Congratulations ${winners}! You ${convertToSecondPerso(config.winCondition)}`
            : `${winners} ${config.winCondition}`;

        this.detailText.setText(detailTextContent);
    }

    private async playAgain(scene: GameScene) {
        try {
            // Buffer critical messages
            const messageBuffer = await RoomManager.quickPlay(scene.playerData.name);

            // Start a new game
            scene.scene.stop(SceneNames.Game);
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
