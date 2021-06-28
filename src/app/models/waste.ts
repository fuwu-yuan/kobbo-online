import {Card, Colors, Names} from './card';
import { v4 as uuidv4 } from 'uuid';
import {Entities} from "@fuwu-yuan/bgew";

export class Waste extends Array<Card> {

  public seed: string;
  public space: Entities.Container|null = null;

  constructor() {
    super();
    this.seed = uuidv4();
  }

  shuffle() {
    return this.sort((a, b) => 0.5 - Math.random());
  }

  draw() {
    return this.shift();
  }
}
