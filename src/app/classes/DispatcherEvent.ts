export class DispatcherEvent {

  private eventName: string;
  private callbacks: ((data:any) => void)[];

  constructor(eventName: string) {
    this.eventName = eventName;
    this.callbacks = [];
  }

  registerCallback(callback: (data:any) => void) {
    this.callbacks.push(callback);
  }

  unregisterCallback(callback: (data:any) => void) {
    const index = this.callbacks.indexOf(callback);
    if (index > -1) {
      this.callbacks.splice(index, 1);
    }
  }

  fire(data: any) {
    const callbacks = this.callbacks.slice(0);
    callbacks.forEach((callback) => {
      callback(data);
    });
  }
}
