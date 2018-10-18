import { Map } from "core-js";
import { observable } from "mobx";
import * as PIXI from "pixi.js";
import TWEEN from "tween.js";
import { TouchEventEmitter } from "./touch";

interface ICell {
  id: string;
  x: number;
  y: number;
  value: number;
}

export class Game {
  @observable
  public score: number;
  public finished: boolean;

  private grid: ICell[];
  private width: number;
  private colorMap: Map<number, number>;
  private graphicMap: Map<number, PIXI.Graphics>;

  private app: PIXI.Application;
  private graphic: PIXI.Graphics;
  private touch: TouchEventEmitter;

  constructor(dom: HTMLElement, socket: SocketIOClient.Socket) {
    this.score = 0;
    this.finished = false;
    this.grid = [];
    this.width = Math.floor(dom.clientWidth / 8) * 8;
    this.app = new PIXI.Application(this.width, this.width, { backgroundColor: 0xbbada0 });

    // init graphics
    this.graphic = new PIXI.Graphics();
    this.graphic.interactive = true;
    this.touch = new TouchEventEmitter(socket);
    const spanWidth = Math.floor(this.width / 4 - 2);
    const length = 4;
    for (let i = 0; i < length; i ++) {
      for (let j = 0; j < length; j ++) {
        this.graphic.lineStyle(0);
        this.graphic.beginFill(0xc3b3a2, 1);
        this.graphic.drawRect( j * spanWidth + 8, i * spanWidth + 8, spanWidth - 8, spanWidth - 8);
      }
    }
    this.app.stage.addChild(this.graphic);

    dom.appendChild(this.app.view);

    this.colorMap = new Map();
    this.colorMap.set(2, 0xeee4d9);
    this.colorMap.set(4, 0xede0c7);
    this.colorMap.set(8, 0xf3b174);
    this.colorMap.set(16, 0xf59563);
    this.colorMap.set(32, 0xf67c5f);
    this.colorMap.set(64, 0xf65e3b);
    this.colorMap.set(128, 0xedcf72);
    this.colorMap.set(256, 0xedc850);
    this.colorMap.set(512, 0x9f44D3);
    this.colorMap.set(1024, 0xe2b0ff);
    this.graphicMap = new Map();

    const frame = (time: any) => {
      TWEEN.update(time);
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  public dispatch(actions: any[]) {
    const spanWidth = Math.floor(this.width / 4 - 2);
    const moves = [];
    const adds = [];
    const dels = [];
    for (const action of actions) {
      console.log(action);
      switch (action.action) {
        case "move":
          moves.push(action.payload);
          break;
        case "add":
          adds.push(action.payload);
          break;
        case "delete":
          dels.push(action.payload);
          break;
        case "score":
          this.score = action.payload;
          break;
        case "finish":
          this.finished = true;
      }
    }
    for (const move of moves) {
      const graphic = this.graphicMap.get(move.id);
      if (graphic) {
        const color = this.colorMap.get(move.value) || 0xc3b3a2;
        graphic.clear();
        graphic.lineStyle(0);
        graphic.beginFill(color, 1);
        const width = spanWidth - 8;
        const height = spanWidth - 8;
        graphic.drawRect(0, 0, width, height);
        const text = graphic.getChildAt(0) as PIXI.Text;
        text.text = String(move.value);
        const style = new PIXI.TextStyle({ fontSize: 32, fill: move.value > 4 ? "#fff" : "#776e65" });
        text.style = style;
        text.x = spanWidth / 2 - text.width / 2;
        text.y = spanWidth / 2 - text.height / 2;

        const left = move.x * spanWidth + 8;
        const top = move.y * spanWidth + 8;
        const tween = new TWEEN.Tween(graphic)
          .to({ x: left, y: top }, 250)
          .yoyo(true)
          .easing(TWEEN.Easing.Quartic.InOut)
          .onComplete(() => {
            TWEEN.remove(tween);
          })
          .start();
        TWEEN.add(tween);
      }
    }
    for (const add of adds) {
      const left = add.x * spanWidth + 8;
      const top = add.y * spanWidth + 8;
      const width = spanWidth - 8;
      const height = spanWidth - 8;

      // Draw text
      const temp = this.colorMap.get(add.value);
      const color = temp || 0xc3b3a2;
      const style = new PIXI.TextStyle({ fontSize: 32, fill: "#776e65" });
      const text = new PIXI.Text(String(add.value), style);
      text.x = spanWidth / 2 - text.width / 2;
      text.y = spanWidth / 2 - text.height / 2;

      // Draw rectangle
      const rectangle = new PIXI.Graphics();
      rectangle.x = left;
      rectangle.y = top;
      rectangle.name = add.id;
      rectangle.addChildAt(text, 0);

      rectangle.lineStyle(0);
      rectangle.beginFill(color, 1);
      rectangle.alpha = 0;
      rectangle.drawRect(0, 0, width, height);

      this.graphicMap.set(add.id, rectangle);
      this.graphic.addChild(rectangle);

      const tween = new TWEEN.Tween(rectangle)
      .to({ alpha: 1 }, 250)
      .yoyo(true)
      .easing(TWEEN.Easing.Quartic.InOut)
      .onComplete(() => {
        TWEEN.remove(tween);
      })
      .start(TWEEN.now() + 250);
      TWEEN.add(tween);
    }
    for (const del of dels) {
      this.graphicMap.delete(del.id);
      const graphic = this.graphic.getChildByName(del.id);
      const tween = new TWEEN.Tween(graphic)
      .to({ alpha: 0 }, 250)
      .yoyo(true)
      .easing(TWEEN.Easing.Quartic.InOut)
      .onComplete(() => {
        this.graphic.removeChild(graphic);
        TWEEN.remove(tween);
      })
      .start();
      TWEEN.add(tween);
    }
  }

  public init() {
    this.graphicMap.clear();
    this.graphic.clear();
    this.graphic.removeChildren();
    const spanWidth = Math.floor(this.width / 4 - 2);
    const length = 4;
    for (let i = 0; i < length; i ++) {
      for (let j = 0; j < length; j ++) {
        const left = j * spanWidth + 8;
        const top = i * spanWidth + 8;
        const width = spanWidth - 8;
        const height = spanWidth - 8;
        const color = 0xc3b3a2;
        this.graphic.lineStyle(0);
        this.graphic.beginFill(color, 1);
        this.graphic.drawRect(left, top, width, height);
      }
    }
  }
}
