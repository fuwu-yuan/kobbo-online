import {Card, Colors, Names} from './card';
import { v4 as uuidv4 } from 'uuid';
import {Entities} from "@fuwu-yuan/bgew";

export class Stock extends Array<Card> {

  public space: Entities.Container|null = null;

  constructor() {
    super();
  }

  /**
   *
   * Init stock
   *
   * @param randomFct An optional custom random function for shuffle. May return number between 0 and 1
   */
  initStock(randomFct: () => number = Math.random) {
    for (const [key, color] of Object.entries(Colors)) {
      for (const [key, name] of Object.entries(Names)) {
        let card = new Card(name, color);
        card.stock = this;
        this.push(card);
      }
    }
    this.shuffle(randomFct);
  }

  topCard(): Card {
    return this[0];
  }

  shuffle(randomFct: () => number = Math.random) {
    return this.sort((a, b) => 0.5 - randomFct());
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
