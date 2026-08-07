import Phase from "@shared/data/phases/Phase";
import PlayerServer from "../bodies/PlayerServer";
import PhaseManagerServer from "../managers/PhaseManagerServer";
import { Position } from "@shared/types";

export default class BotPerception {
    constructor(
        private readonly otherPlayer: PlayerServer,
        private readonly phaseManager: PhaseManagerServer
    ) {

    }

    get currentPhase() {
        return this.phaseManager.getCurrentPhase();
    }

    get otherPlayerPosition(): Position {
        return this.otherPlayer.getPosition();
    }
}