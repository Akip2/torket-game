import { MapSchema, Schema, type } from "@colyseus/schema";
import { FREE_ROAM, PLAYER_CONST } from "@shared/const";
import { PlayerState } from "@shared/enums/PlayerState.enum";
import { InputPayload } from "@shared/types";

export class Player extends Schema {
  inputQueue: InputPayload[] = [];

  @type("string") pseudo: string;

  @type("number") x: number;
  @type("number") y: number;

  @type("number") mouseX: number = 0;
  @type("number") mouseY: number = 0;

  @type("boolean") isAlive: boolean = true;
  @type("number") hp: number;

  @type("number") movementLeft: number = PLAYER_CONST.BASE_MAX_MOVEMENT;
  
  @type("number") timeStamp: number;

  @type("string") state: PlayerState = FREE_ROAM ? PlayerState.Free : PlayerState.Inactive;
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}
