import { Socket } from "socket.io";
import { Game } from "../model/game";
import { GameContractService } from "../service/contract";

const contract = new GameContractService();

export function handleConnection(socket: Socket) {
  let username = "";
  let timer: NodeJS.Timer;
  const game = new Game();
  socket.on("start", (user: string) => {
    username = user;
    contract.getBalance(user).then((balance) => {
      if (balance > 0.5) {
        contract.pay(user, 0.5).then(() => {
          socket.emit("balance", balance - 0.5);
          game.start();
        });
      }
    });
  });
  socket.on("move", (deltaX: number, deltaY: number) => {
    game.move(deltaX, deltaY);
  });
  socket.on("balance", (user) => {
    contract.getBalance(user).then((data) => {
      socket.emit("balance",  data);
    });
  });
  socket.on("records", () => {
    contract.getRecords()
    .then((records) => {
      const sortedRecords = records ? records.sort((pre, cur) => {
        return pre.score < cur.score ? 1 : pre.score === cur.score ? 0 : -1;
      }) : [];
      socket.emit("records", sortedRecords);
    })
    .catch((err) => {
      console.log(err);
    });
  });
  socket.on("end", () => {
    game.emit("end", game.grid.score);
  });
  game.on("end", (data) => {
    contract.getRecords().then((records) => {
      contract.insertRecord(username, data).then(() => {
        const index = records.findIndex((record) => record.score > data);
        if (index === -1) {
          clearTimeout(timer);
          socket.emit("end", "win");
          timer = setTimeout(() => {
            contract.getBalance("game").then((amount) => {
              contract.reward(username, amount).then(() => {
                socket.emit("end", "score");
              });
            });
          }, 1000);
        } else {
          socket.emit("end", "lose");
        }
      });
    });
  });
  game.on("refresh", (data) => {
    socket.emit("refresh", data);
  });
  game.on("actions", (actions) => {
    socket.emit("actions", actions);
  });
}
