import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
import { Engine } from "matter-js"
import { GAME_HEIGHT, GAME_WIDTH, GRAVITY, PLAYER_CONST } from "@shared/const";
import PlayerBody from "../bodies/PlayerBody";
import GroundBlock from "../bodies/GroundBlock";
import Matter from "matter-js";
import { RessourceKeys } from "@shared/enums/RessourceKeys.enum";
import { parsePlayerLabel } from "@shared/utils";
import { InputPayload } from "src/types";

export class MyRoom extends Room<MyRoomState> {
      elapsedTime = 0;
    fixedTimeStep = 1000 / 60;
  maxClients = 4;
  state = new MyRoomState();

  engine!: Engine;
  playerBodies: Map<string, PlayerBody> = new Map();

  onCreate(options: any) {
    this.onMessage("move", (client, inputPayload) => {
      const player = this.state.players.get(client.sessionId);
      player.inputQueue.push(inputPayload);

      /*
      const playerBody = this.playerBodies.get(client.sessionId);
      if (!playerBody) return;

      playerBody.checkForMovements(inputPayload);
      */
    });

    let elapsedTime = 0;
    this.setSimulationInterval((deltaTime) => {
      elapsedTime += deltaTime;

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.fixedTick(this.fixedTimeStep);
      }
    });

    this.setupEnvironment();
  }

  setupEnvironment() {
    this.engine = Engine.create({
      gravity: { x: 0, y: GRAVITY }
    });

    const ground = new GroundBlock(
      GAME_WIDTH / 2,
      GAME_HEIGHT - (GAME_HEIGHT / 5) / 2,
      GAME_WIDTH,
      GAME_HEIGHT / 5,
    );
    ground.addToWorld(this.engine.world);

    this.setupCollisionEvents();
  }

  setupCollisionEvents() {
    Matter.Events.on(this.engine, "collisionStart", (event) => {
      for (const pair of event.pairs) {
        const { bodyA, bodyB } = pair;

        const labels = [bodyA.label, bodyB.label];
        const playerLabel = labels.find(label => label.startsWith("player:"));

        if (playerLabel && labels.includes(RessourceKeys.Ground)) {
          const sessionId = parsePlayerLabel(playerLabel).sessionId;

          this.playerBodies.get(sessionId).isOnGround = true;
        }
      }
    });
  }

  fixedTick(deltaTime: number) {
    this.state.players.forEach((player, id) => {
      const playerBody = this.playerBodies.get(id);
      if (!playerBody) return;

      let input: InputPayload;
      while (input = player.inputQueue.shift()) {
        playerBody.checkForMovements(input);
        Engine.update(this.engine, deltaTime);
        player.x = playerBody.getX();
        player.y = playerBody.getY();
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const player = new Player();
    player.x = Math.random() * GAME_WIDTH;
    player.y = 0;

    const playerBody = new PlayerBody(client.sessionId, player.x, player.y);
    playerBody.addToWorld(this.engine.world);

    this.playerBodies.set(client.sessionId, playerBody);
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    const playerBody = this.playerBodies.get(client.sessionId);
    if (playerBody) {
      playerBody.removeFromWorld(this.engine.world);
      this.playerBodies.delete(client.sessionId);
    }

    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}