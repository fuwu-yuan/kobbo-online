import {Card} from "./card";
import {Config} from "../engine/config";

export class Player {

  private _id: number;
  private _cards: (Card|null)[] = [null, null, null, null];
  private _name: string;

  private config: Config;

  constructor(id: number, name: string, config: Config) {
    this._id = id;
    this._cards = [];
    this._name = name;
    this.config = config;
  }

  get id() {
    return this._id
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
