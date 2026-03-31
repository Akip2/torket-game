import { GAME_HEIGHT, GAME_WIDTH } from "@shared/const";
import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import type GameScene from "../../scenes/GameScene";
import { TextStyle } from "../ui-styles";
import { Action } from "@shared/enums/Action.enum";
import type { Room } from "colyseus.js";
import ActionButton from "../buttons/ActionButton";

export default class ActionChoicePanel {
    container: Phaser.GameObjects.Container;
    private scene: GameScene;
    private moveButton!: ActionButton;
    private shootButton!: ActionButton;

    constructor(scene: GameScene) {
        this.scene = scene;
        this.container = scene.add.container(0, 0);
        scene.uiContainer.add(this.container);

        this.container.setDepth(0);
        scene.uiContainer.sort('depth'); // fix display order

        // Darker, more visible background
        const background = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.7);
        this.container.add(background);

        const instructionText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 140, 'Choose your action', {
            ...TextStyle.PhaseDisplayer,
            fontSize: '70px',
            color: '#00ff00',
            fontStyle: 'bold'
        });
        instructionText.setOrigin(0.5, 0.5);
        instructionText.setDepth(1);
        this.container.add(instructionText);

        // Add subtle pulsing effect to title
        scene.tweens.add({
            targets: instructionText,
            alpha: 0.8,
            yoyo: true,
            repeat: -1,
            duration: 2000,
            ease: 'Sine.easeInOut'
        });

        this.moveButton = new ActionButton(
            scene,
            GAME_WIDTH / 2 - 150,
            GAME_HEIGHT / 2 + 50,
            Action.Move,
            () => this.selectAction(scene.room, Action.Move),
        );
        this.moveButton.setScale(0.8);
        this.moveButton.setAlpha(0);
        this.container.add(this.moveButton);

        this.shootButton = new ActionButton(
            scene,
            GAME_WIDTH / 2 + 150,
            GAME_HEIGHT / 2 + 50,
            Action.Shoot,
            () => this.selectAction(scene.room, Action.Shoot)
        );
        this.shootButton.setScale(0.8);
        this.shootButton.setAlpha(0);
        this.container.add(this.shootButton);

        this.hideInstantly();
    }

    selectAction(room: Room | undefined, action: Action) {
        this.scene.effectsManager.flash(0x0000ff, 500, 0.4);

        room?.send(RequestTypes.SelectAction, { action });
        this.hide();
    }

    show() {
        this.container.setVisible(true);
        this.scene.tweens.add({
            targets: this.moveButton,
            scale: 1,
            alpha: 1,
            duration: 300,
            delay: 100,
            ease: 'Back.easeOut'
        });
        this.scene.tweens.add({
            targets: this.shootButton,
            scale: 1,
            alpha: 1,
            duration: 300,
            delay: 200,
            ease: 'Back.easeOut'
        });
    }

    hide() {
        this.scene.tweens.add({
            targets: this.moveButton,
            scale: 0.8,
            alpha: 0,
            duration: 200,
            ease: 'Quad.easeIn'
        });
        this.scene.tweens.add({
            targets: this.shootButton,
            scale: 0.8,
            alpha: 0,
            duration: 200,
            ease: 'Quad.easeIn'
        });
        
        setTimeout(() => {
            this.hideInstantly();
        }, 200);
    }

    hideInstantly() {
        this.container.setVisible(false);
    }
}
