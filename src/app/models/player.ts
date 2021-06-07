import {Card} from "./card";

export class Player {
  public index: number;
  public uid: string;
  public cards: (Card|null)[] = [null, null, null, null];
  public name: string;
  public isHost: boolean;
  public ready: boolean;

  constructor(index: number, uid: string, name: string) {
    this.index = index;
    this.uid = uid;
    this.cards = [];
    this.name = name;
    this.isHost = false;
    this.ready = false;
  }

  static fromObject(obj: any): Player {
    let keys = Object.keys(obj);
    if (keys.indexOf("index") === -1 || keys.indexOf("uid") === -1 || keys.indexOf("name") === -1) {
      throw new Error("Missing required keys: index, uid, name");
    }
    return Object.assign(new Player(0, "", ""), obj);
  }

  giveCard(card: Card|null, i: number|null = null) {
    if (i === null) {
      this.cards.push(card);
    }else {
      this.cards.splice(i, 0, card);
    }
  }

  getCardAt(i: number): Card|null {
    return this.cards[i];
  }
}
