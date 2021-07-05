import {Card, Colors, Names} from './card';
import { v4 as uuidv4 } from 'uuid';
import {Entities} from "@fuwu-yuan/bgew";

export class Waste extends Array<Card> {

  public space: Entities.Container|null = null;

  constructor() {
    super();
  }

  topCard(): Card {
    return this[this.length-1];
  }

}
