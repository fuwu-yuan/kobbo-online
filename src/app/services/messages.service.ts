import {Dispatcher} from "../classes/Dispatcher";

export class MessagesService {

  protected chatElem: HTMLElement | null;
  protected messages: HTMLElement | null;
  protected input: HTMLInputElement | null;
  protected static _instance: MessagesService|null = null;
  protected _dispatcher = new Dispatcher();

  private constructor() {
    this.chatElem = document.getElementById("chat");
    this.messages = document.querySelector("#chat .messages");
    this.input = document.querySelector("#chat input[name='msg']");

    if (this.input) {
      this.input.onkeyup = (event: KeyboardEvent) => {
        if (event.keyCode === 13) {
          if (this.input) {
            if (this.input.value.length > 0) {
              this._dispatcher.dispatch("message", this.input.value);
              this.input.value = "";
            }
          }
        }
      }
    }
  }

  onMessageSent(callback: (message: string) => void) {
    this._dispatcher.on("message", callback);
  }

  offMessageSent(callback: (message: string) => void) {
    this._dispatcher.off("message", callback);
  }

  static getInstance(): MessagesService {
    if (this._instance === null) {
      this._instance = new MessagesService();
    }
    return this._instance;
  }

  clear() {
    if (this.messages) {
      this.messages.innerHTML = "";
    }
  }

  show() {
    if (this.chatElem) {
      let classes = this.chatElem.classList;
      classes.add("show");
      this.chatElem.className = classes.value;
    }
  }

  hide() {
    if (this.chatElem) {
      let classes = this.chatElem.classList;
      classes.remove("show");
      this.chatElem.className = classes.value;
    }
  }

  /**
   *
   * @param title Message title (will be displayed as [title])
   * @param message Your message
   * @param important Will display message as important style
   *
   * @return uid Message UID (can be used to edit(uid))
   */
  add(title: string, message: string, important: boolean = false): string {
    /**
     * <div class="title game">[Kobbo]</div>
     * <div class="message important">This is a test</div>
     */

    let uid = (new Date()).getTime().toString();
    if (this.messages) {
      let titleElem = document.createElement("div");
      titleElem.id = "msg-title-"+uid;
      titleElem.className = "title";
      if (title === "Kobbo") {
        titleElem.className = titleElem.className + " game";
      }
      titleElem.innerHTML = `[${title}]`;

      let messageElem = document.createElement("div");
      messageElem.id = "msg-body-"+uid;
      messageElem.className = "message";
      if (important) {
        messageElem.className = messageElem.className + " important";
      }
      messageElem.innerHTML = message;

      this.messages.append(titleElem);
      this.messages.append(messageElem);
      this.messages.scrollTop = this.messages.scrollHeight;
    }
    return uid;
  }

  edit(messageUID: string, title: any = null, message: any = null) {
    let titleElem = document.getElementById("msg-title-"+messageUID);
    let msgElem = document.getElementById("msg-body-"+messageUID);

    if (title && titleElem) {
      titleElem.innerHTML = title;
    }
    if (message && msgElem) {
      msgElem.innerHTML = message;
    }
  }
}
