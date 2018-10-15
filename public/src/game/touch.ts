import { EventEmitter } from "./event";
import { TouchEvent } from "react";

export class TouchEventEmitter extends EventEmitter<any> {
  private x: number;
  private y: number;
  private offsetX: number;
  private offsetY: number;
  private socket: SocketIOClient.Socket;

  constructor(socket: SocketIOClient.Socket) {
    super();

    this.x = 0;
    this.y = 0;
    this.offsetX = 0;
    this.offsetY = 0;
    this.socket = socket;

    document.addEventListener("touchstart", this.handleTouchStart.bind(this));
    document.addEventListener("touchmove", this.handleTouch.bind(this));
    document.addEventListener("touchend", this.handleTouchEnd.bind(this));
    document.addEventListener("keydown", this.handleKeyDown.bind(this));
  }
  

  private handleTouchStart(e: TouchEvent) {
    this.x = e.touches[0].clientX;
    this.y = e.touches[0].clientY;
  }

  private handleTouch(e: TouchEvent) {
    const { clientX, clientY } = e.touches[0];
    this.offsetX = clientX - this.x;
    this.offsetY = clientY - this.y;
  }

  private handleTouchEnd(e: TouchEvent) {
    const absoluteX = Math.abs(this.offsetX);
    const absoluteY = Math.abs(this.offsetY);

    let deltaX = 0;
    let deltaY = 0;

    if (absoluteX > absoluteY) {
      if (this.offsetX > 0) {
        deltaX = 1;
        deltaY = 0;
      } else if (this.offsetX < 0) {
        deltaX = -1;
        deltaY = 0;
      }
    } else if (absoluteX < absoluteY) {
      if (this.offsetY > 0) {
        deltaX = 0;
        deltaY = 1;
      } else if (this.offsetY < 0) {
        deltaX = 0;
        deltaY = -1;
      }
    }
    if ((deltaX === 0) && (deltaY === 0)) {
      return;
    }
    this.socket.emit('move', deltaX, deltaY);
  }

  private handleKeyDown(e: KeyboardEvent) {
    switch(e.keyCode) {
      case 37:
        this.socket.emit('move', -1, 0);
        break;
      case 38:
        this.socket.emit('move', 0, -1);
        break;
      case 39:
        this.socket.emit('move', 1, 0);
        break;
      case 40:
        this.socket.emit('move', 0, 1);
        break;
    }
  }
}
