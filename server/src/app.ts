import CORS from "cors";

import { Map } from "core-js";
import Express from "express";
import Http from "http";
import SocketIO from "socket.io";

import { handleConnection } from "./handler/connection";
import { Player } from "./model/player";
import { ContractService } from "./service/contract";

interface IAppSet {
  timer: NodeJS.Timer | null;
}

export const appSet: IAppSet = { timer: null };
export const contract = new ContractService();
export const map = new Map<string, Player>();

const app = Express();
app.use(CORS({ credentials: true }));

const server = Http.createServer(app);
server.listen(3000);
export const io = SocketIO(server);

io.on("connection", handleConnection);
