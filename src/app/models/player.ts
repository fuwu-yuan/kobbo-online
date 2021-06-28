import {Card} from "./card";
import {Entities} from "@fuwu-yuan/bgew";
import {Kobbo} from "../game/Kobbo";

export class Player {
  public index: number;
  public uid: string;
  public cards: (Card|null)[] = [null, null, null, null];
  public name: string;
  public isHost: boolean;
  public ready: boolean;
  public space: Entities.Container | null = null;

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
    let playerSpace = this.space as Entities.Container;
    if (card) {
      card.reset();
      const UP = 0;
      const DOWN = playerSpace.height-card.height;
      const LEFT = 0;
      const RIGHT = playerSpace.width-card.width;

      let positions = [
        {y: DOWN, x: LEFT},
        {y: DOWN, x: RIGHT},
        {y: UP, x: LEFT},
        {y: UP, x: RIGHT},
        {y: DOWN, x: RIGHT*2},
        {y: UP, x: RIGHT*2},
        {y: DOWN, x: RIGHT*3},
        {y: UP, x: RIGHT*3},
        {y: DOWN, x: RIGHT*4},
        {y: UP, x: RIGHT*4}
      ];

      let p;
      if (i === null) {
        p = positions[this.cards.length];
      }else {
        p = positions[i];
      }
      if (p) {
        card.x = p.x;
        card.y = p.y;
        card.rotate = 0;
        card.owner = this;
        card.showCard(false);
        playerSpace.addEntity(card);
      }
    }

    if (i === null) {
      this.cards.push(card);
    }else {
      this.cards[i] = card;
    }
  }

  removeCard(card: Card): number {
    let playerSpace = this.space as Entities.Container;
    console.log(this.cards);
    let i = this.cards.indexOf(card);
    if (i > -1) {
      this.cards[i] = null;
      if (card.owner === this) {
        card.owner = null;
      }
      playerSpace.removeEntity(card);
    }
    return i;
  }

  getCardAt(i: number): Card|null {
    return this.cards[i];
  }
}
