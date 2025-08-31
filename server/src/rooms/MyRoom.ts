import { Room, Client } from "@colyseus/core";
import { MyRoomState, Player } from "./schema/MyRoomState";
import Matter, { Bodies, Body, Engine, World } from "matter-js"
import { GAME_HEIGHT, GAME_WIDTH, GRAVITY, PLAYER_CONST } from "@shared/const";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;
  state = new MyRoomState();

  engine!: Engine;
  playerBodies: Map<string, Body> = new Map();

  onCreate(options: any) {
    this.onMessage("move", (client, inputPayload) => {
      const playerBody = this.playerBodies.get(client.sessionId);
      if (!playerBody) return;

      if (inputPayload.left) {
        Matter.Body.setVelocity(playerBody, {
          x: -PLAYER_CONST.SPEED,
          y: playerBody.velocity.y
        });
      } else if (inputPayload.right) {
        Matter.Body.setVelocity(playerBody, {
          x: PLAYER_CONST.SPEED,
          y: playerBody.velocity.y
        });
      }

      if (inputPayload.up) {
        Matter.Body.setVelocity(playerBody, {
          x: playerBody.velocity.x,
          y: -14
        });
      }
    });

    this.engine = Engine.create({
      gravity: { x: 0, y: GRAVITY }
    });

    const ground = Bodies.rectangle(
      GAME_WIDTH / 2,
      GAME_HEIGHT - (GAME_HEIGHT / 5) / 2,
      GAME_WIDTH,
      GAME_HEIGHT / 5,
      { isStatic: true }
    );

    World.add(this.engine.world, [ground]);

    this.setSimulationInterval((deltaTime) => this.update(deltaTime));
  }

  update(deltaTime: number) {
    Engine.update(this.engine, deltaTime);

    this.state.players.forEach((player, id) => {
      const body = this.playerBodies.get(id);
      if (!body) return;

      player.x = body.position.x;
      player.y = body.position.y;
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const player = new Player();
    player.x = Math.random() * GAME_WIDTH;
    player.y = 0;

    const playerBody = Bodies.rectangle(player.x, player.y, PLAYER_CONST.WIDTH, PLAYER_CONST.WIDTH, {
      friction: 0,
      frictionAir: 0.05,
      frictionStatic: 0 
    });

    Matter.Body.setInertia(playerBody, Infinity);
    World.add(this.engine.world, playerBody);

    this.playerBodies.set(client.sessionId, playerBody);
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");

    const body = this.playerBodies.get(client.sessionId);
    if (body) {
      World.remove(this.engine.world, body);
      this.playerBodies.delete(client.sessionId);
    }

    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}