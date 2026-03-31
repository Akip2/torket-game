import { Depths } from "@shared/enums/Depths.eunum";
import { SceneNames } from "@shared/enums/SceneNames.enum";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import type GameScene from "../../scenes/GameScene";
import { wait } from "@shared/utils";
import { getServerUrl, showToast } from "../../client-utils";
import UiButton from "../buttons/UiButton";
import { ButtonStyle } from "../ui-styles";
import { Client, ServerError } from "colyseus.js";

export type GameEndScreenConfig = {
    isWin: boolean;
    winnerName?: string;
};

export default class GameEndScreen extends Phaser.GameObjects.Container {
    background: Phaser.GameObjects.Rectangle;
    messageText: Phaser.GameObjects.Text;
    detailText: Phaser.GameObjects.Text;

    constructor(scene: GameScene, config: GameEndScreenConfig) {
        super(scene, 0, 0);

        scene.uiContainer.add(this);
        this.setDepth(Depths.First);
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

        const messageColor = config.isWin ? "#00ff00" : "#ff0000";
        const messageText = config.isWin ? "VICTORY !" : "DEFEAT !";

        this.messageText = scene.add.text(
            scene.cameras.main.centerX,
            scene.cameras.main.centerY - 60,
            messageText,
            {
                fontSize: "64px",
                color: messageColor,
                fontStyle: "bold",
                fontFamily: "Arial",
            }
        );
        this.messageText.setOrigin(0.5);
        this.messageText.setScrollFactor(0);
        this.add(this.messageText);

        const detailTextContent = config.isWin
            ? `Congratulations ${config.winnerName}!`
            : `${config.winnerName} won the game...`;

        this.detailText = scene.add.text(
            scene.cameras.main.centerX,
            scene.cameras.main.centerY + 40,
            detailTextContent,
            {
                fontSize: "24px",
                color: "#ffffff",
                fontFamily: "Arial",
            }
        );
        this.detailText.setOrigin(0.5);
        this.detailText.setScrollFactor(0);
        this.add(this.detailText);

        // Back to Menu button
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

        // Play Again button
        const playAgainButton = new UiButton(
            scene,
            scene.cameras.main.centerX + 120,
            scene.cameras.main.centerY + 130,
            "PLAY AGAIN",
            () => {
                this.quickPlay(scene);
            },
            ButtonStyle.GameEndButton
        );
        this.add(playAgainButton);

        this.appear(scene);
    }

    private async quickPlay(scene: GameScene) {
        const client = new Client(getServerUrl());
        
        try {
            const room = await client.joinOrCreate("my_room", {
                playerData: { name: scene.playerData.name }
            });

            // Buffer critical messages
            const messageBuffer: { type: RequestTypes, data: any }[] = [];
            
            room.onMessage(RequestTypes.FullSynchro, (data) => {
                messageBuffer.push({ type: RequestTypes.FullSynchro, data });
            });
            room.onMessage(RequestTypes.TerrainSynchro, (data) => {
                messageBuffer.push({ type: RequestTypes.TerrainSynchro, data });
            });
            room.onMessage(RequestTypes.PhaseSynchro, (data) => {
                messageBuffer.push({ type: RequestTypes.PhaseSynchro, data });
            });

            // Close the current room before starting new game
            if (scene.room) {
                scene.room.leave();
            }

            // Start a new game
            scene.scene.start(SceneNames.Game, {
                playerData: { name: scene.playerData.name },
                room,
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
