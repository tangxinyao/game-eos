import { action, observable } from "mobx";
import { NotificationManager } from "react-notifications";
import io from "socket.io-client";
import { Game } from "./game";
import { TouchEventEmitter } from "./game/touch";

// As scripts executed, Store is instiantiated, and socket connection will be built immediately.
// After a short time, when DOM has been rendered, the game can be attached.

export class Store {
  @observable
  public name?: string;
  @observable
  public maxScore?: number;
  @observable
  public myMaxScore?: number;
  @observable
  public records?: any[];
  @observable
  public balance?: number;

  private game?: Game;
  private socket: SocketIOClient.Socket;
  private dom?: HTMLElement;

  constructor() {
    this.name = "alice";
    this.socket = io((window as any).env.url);
    this.socket.on("connect", this.handleConnect.bind(this));
    this.socket.on("login_resp", this.handleLogin.bind(this));
    this.socket.on("get_records_resp", this.handleRecords.bind(this));
    this.socket.on("get_balance_resp", this.handleBalance.bind(this));
    this.socket.on("end_resp", this.handleEnd.bind(this));
    this.socket.on("error_resp", this.handleError.bind(this));
    this.socket.on("actions_resp", this.handleActions.bind(this));
  }

  public getScore() {
    return this.game && this.game.score || 0;
  }

  public startGame() {
    if (this.game) {
      this.game.init();
    }
    this.socket.emit("start_req");
  }

  public endGame() {
    if (this.game) {
      this.game.init();
    }
    this.socket.emit("end_req");
  }

  // Initial the game, tell pixi.js which dom to use.
  public initialGame(dom: HTMLElement) {
    this.dom = dom;
    this.game = new Game(dom, this.socket);
  }

  // As socket has been connected, user logged in.
  private handleConnect(data: any) {
    this.socket.emit("login_req", this.name);
  }

  // After user logged in, retrieve the balance and records.
  private handleLogin() {
    this.socket.emit("get_balance_req");
    this.socket.emit("get_records_req");
  }

  private handleBalance(data: any) {
    this.balance = data;
  }

  private handleRecords(records: any) {
    this.records = records.splice(0, 10);
    this.maxScore = records[0] && records[0].score || 0;
    this.myMaxScore = records.find((record: any) => record.user === this.name);
  }

  private handleEnd(data: any) {
    if (data === "lose") {
      NotificationManager.error("You lose.", "Sorry");
    } else if (data === "win") {
      this.socket.emit("records");
      NotificationManager.success("You win.", "Congradulations");
    } else if (data === "score") {
      NotificationManager.success("You keep your record for 1 day.", "Congradulations");
    }
  }

  private handleActions(actions: any[]) {
    if (this.game) {
      this.game.dispatch(actions);
      if (this.game.finished) {
        this.endGame();
      }
    }
  }

  private handleError(data: any) {
    console.log(data);
  }
}
