
export class MessagesService {

  private messagesElem: HTMLElement | null;
  private static _instance: MessagesService|null = null;

  private constructor() {
    this.messagesElem = document.getElementById("messages");
  }

  static getInstance(): MessagesService {
    if (this._instance === null) {
      this._instance = new MessagesService();
    }
    return this._instance;
  }

  clear() {
    if (this.messagesElem) {
      this.messagesElem.innerHTML = "<h2>KOBBO</h2>";
    }
  }

  show() {
    if (this.messagesElem) {
      this.messagesElem.className = this.messagesElem?.className + " show";
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
    if (this.messagesElem) {
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

      this.messagesElem.append(titleElem);
      this.messagesElem.append(messageElem);
      this.messagesElem.scrollTop = this.messagesElem.scrollHeight;
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
