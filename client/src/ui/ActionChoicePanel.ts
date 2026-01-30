import { GAME_HEIGHT, GAME_WIDTH } from "@shared/const";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import type GameScene from "../scenes/GameScene";
import { TextStyle } from "./ui-styles";
import { Action } from "@shared/enums/Action.enum";
import type { Room } from "colyseus.js";
import ActionButton from "./buttons/ActionButton";

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

        const moveButton = new ActionButton(
            scene,
            GAME_WIDTH / 2 - 150,
            GAME_HEIGHT / 2,
            Action.Move,
            () => this.selectAction(scene.room, Action.Move),
        );

        this.container.add(moveButton);

        const shootButton = new ActionButton(
            scene,
            GAME_WIDTH / 2 + 150,
            GAME_HEIGHT / 2,
            Action.Shoot,
            () => this.selectAction(scene.room, Action.Shoot)
        );
        this.container.add(shootButton);

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
