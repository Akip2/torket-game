import type { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import type GameScene from "../scenes/GameScene";

export default class SoundManager {
    private static sound: Phaser.Sound.NoAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager | Phaser.Sound.WebAudioSoundManager;

    static init(scene: GameScene) {
        SoundManager.sound = scene.sound;
    }

    static play(key: RessourceKeys, extra: Phaser.Types.Sound.SoundConfig = {}) {
        SoundManager.sound.play(key, extra);
    }
}