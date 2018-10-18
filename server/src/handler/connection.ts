
import { Socket } from "socket.io";
import { v4 } from "uuid";
import { contract, map } from "../app";
import { Player } from "../model/player";

export function handleConnection(socket: Socket) {
  const uuid = v4();
  socket.on("login_req", (name: string) => {
    // If player existed, we all know that the game has not finished,
    // we will reset the socket, and tell the user.
    map.set(uuid, new Player(socket, contract, name));
    // player = map.get(name);
    // if (player) {
    //   player.reconnect(socket);
    // } else {
    //   map.set(name, new Player(socket, contract, name));
    // }
    socket.emit("login_resp");
  });
  socket.on("disconnect", () => {
    map.delete(uuid);
  });
}
