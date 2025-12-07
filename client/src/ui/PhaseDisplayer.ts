import { GAME_WIDTH } from "@shared/const";
import type GameScene from "../scenes/GameScene";
import UiText from "./UiText";
import type PhaseManagerClient from "../managers/PhaseManagerClient";
import type Phase from "@shared/data/phases/Phase";
import type TimedPhase from "@shared/data/phases/TimedPhase";

export default class PhaseDisplayer extends UiText {
    phaseManager: PhaseManagerClient;
    lastDisplayedPhase?: Phase;

    constructor(
        scene: GameScene,
        phaseManager: PhaseManagerClient,
        style: Phaser.Types.GameObjects.Text.TextStyle
    ) {
        const phaseName = phaseManager.currentPhase.name
        super(scene, phaseName, GAME_WIDTH / 2, 15, style);
        this.phaseManager = phaseManager;
    }

    update(): void {
        const currentPhase = this.phaseManager.currentPhase;
        if (currentPhase.isTimed || currentPhase != this.lastDisplayedPhase) {
            this.lastDisplayedPhase = currentPhase;

            this.setText(currentPhase.name);
            this.x = (GAME_WIDTH / 2) - this.width / 2;

            if (currentPhase.isTimed) {
                const timeLeft = (currentPhase as TimedPhase).getTimeLeft();
                const seconds = Math.ceil(timeLeft / 1000);
                const milliseconds = Math.floor((timeLeft % 1000) / 100)
                    .toString()
                    .padStart(1, "0");

                this.setText(`${this.text} : ${seconds}.${milliseconds}`)
            }
        }
    }
}