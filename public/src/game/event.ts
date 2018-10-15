import { Map } from "core-js";

export class EventEmitter<T> {
  private events: Map<string, (data: T) => void>;

  constructor() {
    this.events = new Map();
  }

  public on(key: string, callback: (data: T) => void) {
    this.events.set(key, callback);
  }

  public emit(key: string, data: T) {
    const callback = this.events.get(key);
    if (callback === undefined) {
      throw new Error("Undefined event");
    }
    callback(data);
  }

  public remove(key: string) {
    this.events.delete(key);
  }

  public removeAll() {
    this.events.clear();
  }
}
