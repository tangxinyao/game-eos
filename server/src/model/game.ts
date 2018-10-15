import { EventEmitter } from "events";
import { Grid } from "./grid";

export class Game extends EventEmitter {
  public grid: Grid;

  constructor() {
    super();
    this.grid = new Grid(this, 4);
  }

  public start() {
    this.grid = new Grid(this, 4);
    this.grid.addRandomCell();
  }

  public move(deltaX: number, deltaY: number) {
    this.grid.pullAndMerge(deltaX, deltaY);
    if (this.grid.isTerminated()) {
      this.emit("end", this.grid.score);
    }
  }
}
