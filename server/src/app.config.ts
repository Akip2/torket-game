import config from "@colyseus/tools";
import fs from "fs";
import path from "path";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";

const LATENCY = 0;

const MAPS_DIR = path.join(__dirname, "../maps");

const MAPS = fs.readdirSync(MAPS_DIR)
    .filter(file => file.endsWith(".json"))
    .map((file) => {
        const raw = fs.readFileSync(path.join(MAPS_DIR, file), "utf-8");
        const map = JSON.parse(raw);
        return {
            id: path.basename(file, ".json"),
            name: parseMapName(path.basename(file, ".json")),
            maxPlayers: map.playerPositions.length,
            playerPositions: map.playerPositions,
            primitive: map.primitive
        };
    });

const DEFAULT_MAP = MAPS.find(m => m.id === DEFAULT_MAP_ID);

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom";
import { matchMaker } from "colyseus";
import { parseMapName } from "./server-utils";
import { DEFAULT_MAP_ID } from "@shared/const";
import { GameMap } from "@shared/types";

export default config({

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('my_room', MyRoom);
        gameServer.simulateLatency(LATENCY);
    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         * Read more: https://expressjs.com/en/starter/basic-routing.html
         */
        app.get("/hello_world", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        /**
         * Use @colyseus/playground
         * (It is not recommended to expose this route in a production environment)
         */
        if (process.env.NODE_ENV !== "production") {
            app.use("/playground", playground());
        }

        /**
         * Use @colyseus/monitor
         * It is recommended to protect this route with a password
         * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
         */
        app.use("/monitor", monitor());

        app.get("/rooms", async (req, res) => {
            res.json(await matchMaker.query({
                name: "my_room",
                locked: false
            }));
        });

        app.get("/maps", async (req, res) => {
            res.json(MAPS)
        });

        app.get("/maps/default", async (req, res) => {
            res.json(DEFAULT_MAP);
        });
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});