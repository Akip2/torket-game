import { MapSchema, Schema, type } from "@colyseus/schema";
import { InputPayload } from "@shared/types";

export class Player extends Schema {
  inputQueue: InputPayload[] = [];

  @type("number") x: number;
  @type("number") y: number;
  @type("number") timeStamp: number;
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
}
