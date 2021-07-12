import {DispatcherEvent} from "./DispatcherEvent";

export class Dispatcher {

  private events: any;

  constructor() {
    this.events = {};
  }

  dispatch(eventName: string, data: any = null) {
    const event = this.events[eventName];
    if (event) {
      event.fire(data);
    }
    const all = this.events["all"];
    if (all) {
      all.fire(data);
    }
  }

  on(eventName: string, callback: (data: any) => void) {
    let event = this.events[eventName];
    if (!event) {
      event = new DispatcherEvent(eventName);
      this.events[eventName] = event;
    }
    event.registerCallback(callback);
  }

  off(eventName: string, callback: (data: any) => void) {
    const event = this.events[eventName];
    if (event && event.callbacks.indexOf(callback) > -1) {
      event.unregisterCallback(callback);
      if (event.callbacks.length === 0) {
        delete this.events[eventName];
      }
    }
  }
}
