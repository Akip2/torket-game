import { GAME_HEIGHT, GAME_WIDTH } from "@shared/const";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import type GameScene from "../scenes/GameScene";
import { TextStyle } from "./ui-styles";
import { Action } from "@shared/enums/Action.enum";
import type { Room } from "colyseus.js";

export default class ActionChoicePanel {
    container: Phaser.GameObjects.Container;

    constructor(scene: GameScene) {
        this.container = scene.add.container(0, 0);
        scene.uiContainer.add(this.container);

        this.container.setDepth(0);
        scene.uiContainer.sort('depth'); // fix display order

        const background = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.3);
        this.container.add(background);

        const instructionText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 140, 'Choose your action', {
            ...TextStyle.PhaseDisplayer,
            fontSize: '50px',
            color: '#ffffff'
        });
        instructionText.setOrigin(0.5, 0.5);
        this.container.add(instructionText);

        const moveButton = scene.add.rectangle(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2, 250, 80, 0x2563eb, 1);
        moveButton.setStrokeStyle(3, 0xffffff);
        moveButton.setInteractive({ useHandCursor: true });
        moveButton.on('pointerdown', () => this.selectAction(scene.room, Action.Move));
        moveButton.on('pointerover', () => moveButton.setFillStyle(0x1d4ed8));
        moveButton.on('pointerout', () => moveButton.setFillStyle(0x2563eb));

        this.container.add(moveButton);

        const moveText = scene.add.text(GAME_WIDTH / 2 - 150, GAME_HEIGHT / 2, 'MOVE', {
            ...TextStyle.PhaseDisplayer,
            fontSize: '32px',
            color: '#ffffff'
        });
        moveText.setOrigin(0.5, 0.5);
        this.container.add(moveText);

        const shootButton = scene.add.rectangle(GAME_WIDTH / 2 + 150, GAME_HEIGHT / 2, 250, 80, 0xdc2626, 1);
        shootButton.setStrokeStyle(3, 0xffffff);
        shootButton.setInteractive({ useHandCursor: true });
        shootButton.on('pointerdown', () => this.selectAction(scene.room, Action.Shoot));
        shootButton.on('pointerover', () => shootButton.setFillStyle(0xb91c1c));
        shootButton.on('pointerout', () => shootButton.setFillStyle(0xdc2626));
        this.container.add(shootButton);

        const shootText = scene.add.text(GAME_WIDTH / 2 + 150, GAME_HEIGHT / 2, 'SHOOT', {
            ...TextStyle.PhaseDisplayer,
            fontSize: '32px',
            color: '#ffffff'
        });
        shootText.setOrigin(0.5, 0.5);
        this.container.add(shootText);

        this.hide();
    }

    selectAction(room: Room, action: Action) {
        room.send(RequestTypes.SelectAction, { action });
        this.hide();
    }

    show() {
        this.container.setVisible(true);
    }

    hide() {
        this.container.setVisible(false);
    }
}
