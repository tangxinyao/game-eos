import { Cell } from "./cell";

// websocket
// action resp
export class Game {
  public size: number;
  public score: number;
  public cells: Array<Array<Cell|null>>;
  public socket: SocketIO.Socket;

  constructor(socket: SocketIO.Socket, size: number) {
    this.socket = socket;
    this.size = size;
    this.score = 0;
    this.cells = [];
    for (let i = 0; i < size; i ++) {
      this.cells[i] = [];
      for (let j = 0; j < size; j ++) {
        this.cells[i][j] = null;
      }
    }
  }

  public toJSON() {
    return {
      cells: this.cells,
      score: this.score,
    };
  }

  // emit actions of delete, update, create.
  public move(deltaX: number, deltaY: number) {
    // When user tring move right or down, one who stands closer to the lower right corner
    // will have higherer priority to move.
    const actions: any[] = [];
    if (deltaX > 0 || deltaY > 0) {
      for (let i = this.size - 1; i >= 0; i --) {
        for (let j = this.size - 1; j >= 0; j --) {
          const current = this.cells[i][j];
          // type 1 do nothing
          // If current span equals null, do nothing
          if (current === null) {
            continue;
          }
          // Check next one, if it is within the boundary and not null or not equals to this one, do nothing.
          let offsetY = i + deltaY;
          let offsetX = j + deltaX;

          let next = this.cells[offsetY] && this.cells[offsetY][offsetX];

          if (offsetX >= this.size || offsetY >= this.size || (next && next.value !== current.value)) {
            continue;
          }

          // now let's move this cell.
          // delete current cell
          this.cells[i][j] = null;
          let movedRL = false;

          while ((offsetX < this.size) && (offsetY < this.size)) {
            next = this.cells[offsetY][offsetX];
            if (next === null) {
              offsetY += deltaY;
              offsetX += deltaX;
              continue;
            }
            if (next.value === current.value) {
              // type 2 move and double
              // count value
              current.x = next.x;
              current.y = next.y;
              current.value = next.value + current.value;

              this.score += current.value;
              this.cells[current.y][current.x] = current;

              actions.push({ action: "move", payload: current});
              actions.push({ action: "delete", payload: next });
              actions.push({ action: "score", payload: this.score });
              movedRL = true;
            }
            break;
          }
          if (!movedRL) {
            // type 3 just move
            // move back
            current.x = offsetX - deltaX;
            current.y = offsetY - deltaY;
            this.cells[current.y][current.x] = current;
            actions.push({ action: "move", payload: current });
          }
        }
      }
    } else if (deltaX < 0 || deltaY < 0) {
      for (let i = 0; i < this.size; i ++) {
        for (let j = 0; j < this.size; j ++) {
          const current = this.cells[i][j];

          if (current === null) {
            continue;
          }

          let offsetY = i + deltaY;
          let offsetX = j + deltaX;

          let next = this.cells[offsetY] && this.cells[offsetY][offsetX];

          if (offsetX < 0 || offsetY < 0 || (next && next.value !== current.value)) {
            continue;
          }

          this.cells[i][j] = null;
          let movedLH = false;
          while (offsetX >= 0 && offsetY >= 0) {
            next = this.cells[offsetY][offsetX];
            if (next === null) {
              offsetY += deltaY;
              offsetX += deltaX;
              continue;
            }
            if (next.value === current.value) {
              current.x = next.x;
              current.y = next.y;
              current.value = next.value + current.value;

              this.score += current.value;
              this.cells[current.y][current.x] = current;

              actions.push({ action: "move", payload: current});
              actions.push({ action: "delete", payload: next });
              actions.push({ action: "score", payload: this.score });
              movedLH = true;
            }
            break;
          }
          if (!movedLH) {
            current.x = offsetX - deltaX;
            current.y = offsetY - deltaY;
            this.cells[current.y][current.x] = current;
            actions.push({ action: "move", payload: current });
          }
        }
      }
    }
    const randomCell = this.getRandomCell();
    if (randomCell) {
      this.cells[randomCell.y][randomCell.x] = randomCell;
      actions.push({ action: "add", payload: randomCell });
    }
    if (this.isTerminated()) {
      actions.push({ action: "finish" });
    }
    this.socket.emit("actions_resp", actions);
  }

  public start() {
    const randomCell = this.getRandomCell();
    const actions = [];
    if (randomCell) {
      this.cells[randomCell.y][randomCell.x] = randomCell;
      actions.push({ action: "add", payload: randomCell });
    }
    this.socket.emit("actions_resp", actions);
  }

  private getRandomCell(): Cell|null {
    // Count how many cells
    let available = 0;
    for (let i = 0; i < this.size; i ++) {
      for (let j = 0; j < this.size; j ++) {
        if (this.cells[i][j] === null) {
          available ++;
        }
      }
    }
    if (available === 0) {
      return null;
    }
    // Place cell into location
    let cursor = Math.floor(Math.random() * available);
    for (let i = 0; i < this.size; i ++) {
      for (let j = 0; j < this.size; j ++) {
        if ((this.cells[i][j] === null) && (cursor-- === 0)) {
          const value = Math.random() < 0.875 ? 2 : 4;
          return new Cell(j, i, value);
        }
      }
    }
    return null;
  }

  private isTerminated() {
    for (let i = 0; i < this.size; i ++) {
      for (let j = 0; j < this.size; j ++) {
        const current = this.cells[i][j];
        const right = this.cells[i][j + 1];
        const down = this.cells[i + 1] && this.cells[i + 1][j];
        if (current === null) {
          return false;
        } else if ((i + 1 < this.size) && (down === null || down.value === current.value)) {
          return false;
        } else if ((j + 1 < this.size) && (right === null || right.value === current.value)) {
          return false;
        }
      }
    }
    return true;
  }
}
