export interface ISerializedCell {
  id: string;
  x: number;
  y: number;
  value: number;
}

export class Cell {
  private static index = 0;
  public id: number;
  public x: number;
  public y: number;
  public value: number;

  constructor(x: number, y: number, value?: number) {
    this.id = Cell.index ++;
    this.x = x;
    this.y = y;
    this.value = value || 2;
  }

  public update(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}
