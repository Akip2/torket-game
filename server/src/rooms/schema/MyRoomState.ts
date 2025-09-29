import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
import { InputPayload } from "@shared/types";

export class Player extends Schema {
  inputQueue: InputPayload[] = [];

  @type("number") x: number;
  @type("number") y: number;
  @type("number") timeStamp: number;
}

export class QuadBlockState extends Schema {
  @type("number") x: number;
  @type("number") y: number;
  @type("number") width: number;
  @type("number") height: number;
  @type("boolean") filled: boolean;

  @type([QuadBlockState]) children = new ArraySchema<QuadBlockState>();

  constructor(
    x: number = 0,
    y: number = 0,
    width: number = 0,
    height: number = 0,
    filled: boolean = true
  ) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.filled = filled;
  }
}

export class MyRoomState extends Schema {
  @type({ map: Player }) players = new MapSchema<Player>();
  @type([QuadBlockState]) terrain = new ArraySchema<QuadBlockState>();
}
