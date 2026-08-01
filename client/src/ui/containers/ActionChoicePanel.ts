import { RequestTypes } from "@shared/enums/RequestTypes.enum";
import type GameScene from "../../scenes/GameScene";
import { TextStyle } from "../ui-styles";
import { Action } from "@shared/enums/Action.enum";
import type { Room } from "colyseus.js";
import ActionButton from "../buttons/ActionButton";
import type { IPlayer } from "@shared/interfaces/Player.interface";

export default class ActionChoicePanel {
    container: Phaser.GameObjects.Container;
    private scene: GameScene;
    private titleText: Phaser.GameObjects.Text;
    private actionButtons: ActionButton[];
    private mainPlayer: IPlayer;
    private validityCallbacks: (() => boolean)[];

    constructor(scene: GameScene, mainPlayer: IPlayer) {
        this.scene = scene;
        this.mainPlayer = mainPlayer;
        this.container = scene.add.container(0, 0);
        scene.uiContainer.add(this.container);

        this.container.setDepth(0);
        scene.uiContainer.sort('depth');

        const viewportCenter = scene.cameraManager.getUiViewportCenter();
        const viewportWidth = scene.cameraManager.getUiViewportWidth();
        const viewportHeight = scene.cameraManager.getUiViewportHeight();

        // Dark background overlay
        const background = scene.add.rectangle(viewportCenter.x, viewportCenter.y, viewportWidth, viewportHeight, 0x000000, 0.75);
        this.container.add(background);

        // Main instruction text
        this.titleText = scene.add.text(viewportCenter.x, viewportCenter.y - 100, 'CHOOSE YOUR ACTION', {
            ...TextStyle.PhaseDisplayer,
            fontSize: '48px',
            color: '#00ffff',
            fontStyle: 'bold'
        });
        this.titleText.setOrigin(0.5, 0.5);
        this.titleText.setDepth(2);
        this.container.add(this.titleText);

        // Add subtle pulsing effect to title
        scene.tweens.add({
            targets: this.titleText,
            scale: 1.05,
            yoyo: true,
            repeat: -1,
            duration: 2000,
            ease: 'Sine.easeInOut'
        });

        // Create buttons
        const buttonY = viewportCenter.y + 60;
        const spacing = 300;

        const actions = [Action.Move, Action.Reload, Action.Shoot];
        const startingX = viewportCenter.x - spacing
        this.actionButtons = [];
        for (let i = 0; i < actions.length; i++) {
            const button = new ActionButton(
                scene,
                startingX + (spacing * i),
                buttonY,
                actions[i],
                () => this.selectAction(scene.room, actions[i]),
            );
            button.setScale(0);
            button.setAlpha(0);

            this.actionButtons.push(button);
            this.container.add(button);
        }

        this.validityCallbacks = [
            () => true, // Move is always valid
            () => this.mainPlayer.hasMaxBulletCount() === false, // Reload is valid if not at max bullets
            () => this.mainPlayer.hasBullets() // Shoot is valid if player has bullets
        ]

        this.hideInstantly();
    }

    selectAction(room: Room | undefined, action: Action) {
        this.scene.effectsManager.flash(0x00d4ff, 400, 0.3);

        // Create click effect
        this.createActionEffect(action);

        room?.send(RequestTypes.SelectAction, { action });
        this.hide();
    }

    private createActionEffect(action: Action) {
        let button: ActionButton;
        let color: number;

        switch (action) {
            case Action.Move:
                button = this.actionButtons[0];
                color = 0x00d4ff;
                break;

            case Action.Reload:
                button = this.actionButtons[1];
                color = 0xffd93d;
                break;

            default:
                button = this.actionButtons[2];
                color = 0xff6b6b;
                break;
        }

        const buttonX = button.x;
        const buttonY = button.y;

        for (let i = 0; i < 12; i++) {
            const angle = (Math.PI * 2 * i) / 12;
            const particle = this.scene.add.circle(buttonX, buttonY, 6, color, 0.8);

            this.scene.tweens.add({
                targets: particle,
                x: buttonX + Math.cos(angle) * 100,
                y: buttonY + Math.sin(angle) * 100,
                alpha: 0,
                scale: 0.3,
                duration: 500,
                ease: 'Quad.easeOut',
                onComplete: () => particle.destroy()
            });
        }
    }

    show() {
        this.container.setVisible(true);

        // Stagger animations for buttons
        this.actionButtons.forEach((b, id) => {
            b.appear(this.scene, 100 + id * 75);

            if (this.validityCallbacks[id]()) {
                b.enable();
            } else {
                b.disable();
            }
        });

        // Add wiggle animation to buttons after they appear
        setTimeout(() => {
            this.scene.tweens.add({
                targets: this.actionButtons,
                angle: 3,
                yoyo: true,
                repeat: 2,
                duration: 100,
                ease: 'Sine.easeInOut'
            });
        }, 350);
    }

    hide() {
        this.actionButtons.forEach((b, id) => {
            b.disappear(this.scene, id * 50);
        });

        setTimeout(() => {
            this.hideInstantly();
        }, 300);
    }

    hideInstantly() {
        this.container.setVisible(false);
    }
}
