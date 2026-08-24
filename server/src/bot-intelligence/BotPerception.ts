import PlayerServer from "../bodies/PlayerServer";
import PhaseManagerServer from "../managers/PhaseManagerServer";
import { Position } from "@shared/types";
import Bot from "../bodies/Bot";
import { MyRoom } from "../rooms/MyRoom";
import QuadBlock from "@shared/data/QuadBlock";

export default class BotPerception {
    private readonly otherPlayer: PlayerServer;
    private readonly phaseManager: PhaseManagerServer;
    private readonly terrainRoot: QuadBlock;
    private readonly self: Bot;

    constructor(
        room: MyRoom,
        bot: Bot
    ) {
        this.otherPlayer = room.playerManager.getPlayersAlive()[0];
        this.phaseManager = room.phaseManager;
        this.terrainRoot = room.terrainManager.root;
        this.self = bot;
    }

    get currentPhase() {
        return this.phaseManager.getCurrentPhase();
    }

    get otherPlayerPosition(): Position {
        return this.otherPlayer.getPosition();
    }

    get selfPosition(): Position {
        return this.self.getPosition();
    }

    get selfVelocity(): Matter.Vector {
        return this.self.getVelocity();
    }

    get selfBulletCount(): number {
        return this.self.getBulletCount();
    }

    get selfMovementLeft(): number {
        return this.self.playerRef.movementLeft;
    }

    get terrain(): QuadBlock {
        return this.terrainRoot;
    }
}