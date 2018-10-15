import CORS from "cors";
import Express from "express";
import Http from "http";
import SocketIO from "socket.io";

import { handleConnection } from "./handler/connection";

const app = Express();
app.use(CORS({ credentials: true }));

const server = Http.createServer(app);
server.listen(3000);
export const io = SocketIO(server);

io.on("connection", handleConnection);
