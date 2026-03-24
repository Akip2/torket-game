import type { AvailableRoomData } from "@shared/types";

export function generateRoomComponent(room: AvailableRoomData) {
    return `
        <tr id='${room.roomId}' data-private=${room.private}>
            <td>${room.metadata.gameName}</td>
            <td>${room.clients} / ${room.maxClients}</td>
            <td>${room.private ? "❌" : "✅"}</td>
        </tr>
        `;
}