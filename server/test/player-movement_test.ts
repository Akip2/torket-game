import assert from "assert";
import PlayerServer from "../src/bodies/PlayerServer";
import { Player } from "../src/rooms/schema/MyRoomState";

describe("PlayerServer movement consumption", () => {
  it("stops horizontal velocity on ground when movement is exhausted", () => {
    const playerRef = new Player();
    const player = new PlayerServer(playerRef, "session", () => undefined);

    player.setVelocity(4, 0);
    player.isOnGround = true;
    playerRef.movementLeft = 1;

    player.decreaseMovementLeft(1);

    assert.strictEqual(player.getVelocity().x, 0);
    assert.strictEqual(playerRef.movementLeft, 0);
  });

  it("keeps horizontal velocity in the air when movement is exhausted", () => {
    const playerRef = new Player();
    const player = new PlayerServer(playerRef, "session", () => undefined);

    player.setVelocity(4, 0);
    player.isOnGround = false;
    playerRef.movementLeft = 1;

    player.decreaseMovementLeft(1);

    assert.strictEqual(player.getVelocity().x, 4);
  });
});
