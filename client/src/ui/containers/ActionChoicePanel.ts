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
    private titleText!: Phaser.GameObjects.Text;

    constructor(scene: GameScene) {
        this.scene = scene;
        this.container = scene.add.container(0, 0);
        scene.uiContainer.add(this.container);

        this.container.setDepth(0);
        scene.uiContainer.sort('depth');

        // Dark background overlay
        const background = scene.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.75);
        this.container.add(background);

        // Main instruction text
        this.titleText = scene.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 100, 'CHOOSE YOUR ACTION', {
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
        const buttonY = GAME_HEIGHT / 2 + 80;

        this.moveButton = new ActionButton(
            scene,
            GAME_WIDTH / 2 - 180,
            buttonY,
            Action.Move,
            () => this.selectAction(scene.room, Action.Move),
        );
        this.moveButton.setScale(0);
        this.moveButton.setAlpha(0);
        this.container.add(this.moveButton);

        this.shootButton = new ActionButton(
            scene,
            GAME_WIDTH / 2 + 180,
            buttonY,
            Action.Shoot,
            () => this.selectAction(scene.room, Action.Shoot)
        );
        this.shootButton.setScale(0);
        this.shootButton.setAlpha(0);
        this.container.add(this.shootButton);

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
        const button = action === Action.Move ? this.moveButton : this.shootButton;
        const buttonX = button.x;
        const buttonY = button.y;
        const color = action === Action.Move ? 0x00d4ff : 0xff6b6b;

        // Create explosion of particles
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
        this.scene.tweens.add({
            targets: this.moveButton,
            scale: 1,
            alpha: 1,
            duration: 400,
            delay: 100,
            ease: 'Back.easeOut'
        });

        this.scene.tweens.add({
            targets: this.shootButton,
            scale: 1,
            alpha: 1,
            duration: 400,
            delay: 250,
            ease: 'Back.easeOut'
        });

        // Add wiggle animation to buttons after they appear
        setTimeout(() => {
            this.scene.tweens.add({
                targets: [this.moveButton, this.shootButton],
                angle: 3,
                yoyo: true,
                repeat: 2,
                duration: 100,
                ease: 'Sine.easeInOut'
            });
        }, 350);
    }

    hide() {
        this.scene.tweens.add({
            targets: this.moveButton,
            scale: 0.5,
            alpha: 0,
            duration: 250,
            ease: 'Quad.easeIn'
        });

        this.scene.tweens.add({
            targets: this.shootButton,
            scale: 0.5,
            alpha: 0,
            duration: 250,
            ease: 'Quad.easeIn',
            delay: 50
        });
        
        setTimeout(() => {
            this.hideInstantly();
        }, 300);
    }

    hideInstantly() {
        this.container.setVisible(false);
    }
}
