import {Card, Colors, Names} from './card';
import { v4 as uuidv4 } from 'uuid';
import {Entities} from "@fuwu-yuan/bgew";

export class Stock extends Array<Card> {

  public seed: string;
  public space: Entities.Container|null = null;

  constructor() {
    super();
    this.seed = uuidv4();
  }

  initStock() {
    for (const [key, color] of Object.entries(Colors)) {
      for (const [key, name] of Object.entries(Names)) {
        let card = new Card(name, color);
        card.stock = this;
        this.push(card);
      }
    }
    this.shuffle();
  }

  topCard(): Card {
    return this[0];
  }

  shuffle() {
    return this.sort((a, b) => 0.5 - Math.random());
  }

  draw() {
    let card = null;
    if (this.length > 0) {
      card = this.shift();
      this.space?.removeEntity(card as Card);
    }
    return card;
  }
}
