
export class DebugService {

  private debugElem: HTMLElement | null;
  private static _instance: DebugService|null = null;

  private constructor() {
    this.debugElem = document.getElementById("debug");
  }

  static getInstance(): DebugService {
    if (this._instance === null) {
      this._instance = new DebugService();
    }
    return this._instance;
  }

  show() {
    if (this.debugElem) {
      this.debugElem.className = this.debugElem?.className + " show";
    }
  }

  clear() {
    if (this.debugElem) {
      this.debugElem.innerHTML = "<h2>DEBUG</h2>";
    }
  }

  /**
   *
   * @param title Message title (will be displayed as [title])
   * @param message Your message
   * @param uid An id used to edit existing debug with same id
   *
   * @return uid Message UID (can be used to edit(uid))
   */
  set(title: string, message: string, uid: string|null = null): string {

    if (uid === null) uid = (new Date()).getTime().toString();

    let titleElem = document.getElementById("debug-title-"+uid);
    let messageElem = document.getElementById("debug-body-"+uid);

    if (titleElem && messageElem) {
      if (title) titleElem.innerHTML = `[${title}]`;
      if (message) messageElem.innerHTML = message;
    }else {
      let titleElem = document.createElement("div");
      titleElem.id = "debug-title-"+uid;
      titleElem.className = "title";
      titleElem.innerHTML = `[${title}]`;

      let messageElem = document.createElement("div");
      messageElem.id = "debug-body-"+uid;
      messageElem.className = "message";
      messageElem.className = messageElem.className + " important";
      messageElem.innerHTML = message;

      let container = document.createElement("div");
      container.className = "container";

      if (this.debugElem) {
        container.append(titleElem);
        container.append(messageElem);
        this.debugElem.append(container);
        this.debugElem.scrollTop = this.debugElem.scrollHeight;
      }
    }

    return uid;
  }
}
