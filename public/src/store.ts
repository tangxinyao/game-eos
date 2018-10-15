import io from 'socket.io-client';
import { NotificationManager } from 'react-notifications';

import { Game } from './game';
import { TouchEventEmitter } from './game/touch';
import { observable } from 'mobx';

export class Store {
  private dom?: HTMLElement;
  private socket: SocketIOClient.Socket;
  public game?: Game;

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

  constructor() {
    this.name = 'alice';
    this.socket = io('http://47.100.208.79:3000');
    this.socket.on('connect', this.handleConnect.bind(this));
    this.socket.on('records', this.handleRecords.bind(this));
    this.socket.on('balance', this.handleBalance.bind(this));
    this.socket.on('end', this.handleEnd.bind(this));
    this.socket.on('actions', this.handleActions.bind(this));
  }

  public initialGame(dom: HTMLElement) {
    this.dom = dom;
    this.game = new Game(dom, this.socket);
  }

  public startGame() {
    if (this.game) {
      this.game.init();
    }
    this.socket.emit('start', this.name);
  }

  public endGame() {
    if (this.game) {
      this.game.init();
    }
    this.socket.emit('end');
  }

  private handleConnect(data: any) {
    this.socket.emit('records');
    this.socket.emit('balance', this.name);
  }

  private handleBalance(data: any) {
    this.balance = data;
  }

  // TODO: handle recordList, get my max socre and global max score
  private handleRecords(records: any) {
    this.records = records.splice(0, 10);
    this.maxScore = records[0] && records[0].score || 0;
    this.myMaxScore = records.find((record: any) => record.user === this.name);
  }

  private handleEnd(data: any) {
    console.log(data);
    if (data === 'lose') {
      NotificationManager.error('You lose.', 'Sorry');
    } else if (data === 'win') {
      this.socket.emit('records');
      NotificationManager.success('You win.', 'Congradulations');
    } else if (data === 'score') {
      NotificationManager.success('You keep your record for 1 day.', 'Congradulations');
    }
  }

  private handleActions(actions: any[]) {
    if (this.game) {
      this.game.dispatch(actions);
    }
  }
}
