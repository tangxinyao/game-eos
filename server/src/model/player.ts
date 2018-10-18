import { Socket } from "socket.io";
import { appSet } from "../app";
import { ContractService } from "../service/contract";
import { Game } from "./game";

export class Player {
  private contract: ContractService;
  private game: Game;
  private name: string;
  private socket: Socket;

  constructor(socket: Socket, contract: ContractService, name: string) {
    this.name = name;
    this.socket = socket;
    this.contract = contract;
    this.game = new Game(socket, 4);

    // set routers here
    socket.on("start_req", this.handleStart.bind(this));
    socket.on("end_req", this.handleEnd.bind(this));
    socket.on("move_req", this.handleMove.bind(this));
    socket.on("get_balance_req", this.handleGetBalance.bind(this));
    socket.on("get_records_req", this.handleGetRecords.bind(this));
  }

  public reconnect(socket: Socket) {
    this.socket = socket;
    this.game.socket = socket;
  }

  // As game started, user spent some token if he/she hold enough.
  private handleStart() {
    this.contract.getBalance(this.name).then((balance) => {
      if (balance < 0.5) {
        this.socket.emit("error_resp", "You have no enough token left");
        return;
      }
      this.contract.pay(this.name, 0.5).then(() => {
        this.socket.emit("get_balance_resp", balance - 0.5);
        this.game.start();
      });
    });
  }

  // After game ended, the user will get some reward if he or she break records and keep the record for 1 day.
  private handleEnd() {
    const score = this.game.score;
    this.contract.getRecords().then((records) => {
      console.log(this.name, score);
      this.contract.insertRecord(this.name, score).then(() => {
        this.contract.getRecords().then((newRecords) => {
          // const sortedRecords = newRecords.sort((pre, cur) => {
          //   return pre.score < cur.score ? 1 : pre.score === cur.score ? 0 : -1;
          // });
          this.socket.emit("get_records_resp", newRecords);
        });

        const index = records.findIndex((record) => record.score > score);
        // The user will lose if he did not break any of the history record.
        if (index !== -1) {
          this.socket.emit("end_resp", "lose");
          return;
        }
        // If there is a timer, just stop it.
        if (appSet.timer !== null) {
          clearTimeout(appSet.timer);
        }
        // Tell the user that he or she wins.
        this.socket.emit("end_resp", "win");
        // Retrieve all the money of the game.
        appSet.timer = setTimeout(() => {
          this.contract.getBalance("game").then((amount) => {
            this.contract.reward(this.name, amount).then(() => {
              this.socket.emit("score_resp", "score");
            });
          });
        }, 10000);
      });
    });
  }

  private handleMove(deltaX: number, deltaY: number) {
    this.game.move(deltaX, deltaY);
  }

  private handleGetBalance() {
    console.log(this.name);
    this.contract.getBalance(this.name).then((data) => {
      this.socket.emit("get_balance_resp",  data);
    });
  }

  private handleGetRecords() {
    this.contract.getRecords()
    .then((records) => {
      this.socket.emit("get_records_resp", records);
    })
    .catch((err) => {
      this.socket.emit("error_resp", err);
    });
  }
}
