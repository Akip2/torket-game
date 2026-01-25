import { GAME_WIDTH } from "@shared/const";
import type GameScene from "../scenes/GameScene";
import UiText from "./UiText";
import type PhaseManagerClient from "../managers/PhaseManagerClient";
import type Phase from "@shared/data/phases/Phase";
import type TimedPhase from "@shared/data/phases/TimedPhase";
import Timer from "./Timer";
import { Depths } from "@shared/enums/Depths.eunum";

export default class PhaseDisplayer extends UiText {
    phaseManager: PhaseManagerClient;
    lastDisplayedPhase?: Phase;
    background: Phaser.GameObjects.Rectangle;
    timer: Timer;

    constructor(
        scene: GameScene,
        phaseManager: PhaseManagerClient,
        style: Phaser.Types.GameObjects.Text.TextStyle
    ) {
        const background = scene.add.rectangle(GAME_WIDTH / 2, 15, 0, 0, 0x1a1a1a, 0.7);
        scene.uiContainer.add(background);

        const phaseName = phaseManager.currentPhase.name
        super(scene, phaseName, GAME_WIDTH / 2, 15, style);
        this.phaseManager = phaseManager;
        this.setOrigin(0, 0);

        this.background = background
        this.background.setDepth(Depths.First - 1);
        this.background.setStrokeStyle(2, 0x44aa44);
        this.background.setOrigin(0.5, 0);

        this.setDepth(Depths.First);
        this.timer = new Timer(scene);
    }

    update(): void {
        const currentPhase = this.phaseManager.currentPhase;
        if (currentPhase.isTimed || currentPhase != this.lastDisplayedPhase) {
            this.lastDisplayedPhase = currentPhase;

            this.setText(currentPhase.name);    
            this.x = (GAME_WIDTH / 2) - this.width / 2;

            const padding = 20;
            const height = 40;
            this.background.setSize(this.width + padding, height);
            this.background.x = GAME_WIDTH / 2;

            if (currentPhase.isTimed) {
                const timeLeft = (currentPhase as TimedPhase).getTimeLeft();
                this.timer.update(timeLeft);
            } else {
                this.timer.disable();
            }
        }
    }
}