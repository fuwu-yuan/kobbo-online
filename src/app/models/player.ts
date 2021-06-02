import {Card} from "./card";

export class Player {

  private _uid: string;
  private _cards: (Card|null)[] = [null, null, null, null];
  private _name: string;

  constructor(uid: string, name: string) {
    this._uid = uid;
    this._cards = [];
    this._name = name;
  }

  get uid() {
    return this._uid
  }

  get cards() {
    return this._cards;
  }

  get name() {
    return this._name;
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
