import type { AvailableRoomData } from "@shared/types";

export function generateRoomList(roomList: AvailableRoomData[]) {
    return roomList.map((room) => {
        return `
        <tr id='${room.roomId}' data-private=${room.private}>
            <td>${room.metadata.gameName}</td>
            <td>${room.clients} / ${room.maxClients}</td>
            <td>${room.private}</td>
        </tr>
        `
    }).join("");
}