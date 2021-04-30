import { Injectable } from '@angular/core';
import {NGXLogger} from "ngx-logger";
import { Card, Colors, Names, Powers, Values } from '../models/card';

@Injectable({
  providedIn: 'root'
})
export class StockService extends Array {

  constructor(
    private logger: NGXLogger
  ) {
    super();
  }

  initStock() {
    this.logger.debug("Initializing stock...")
    for (const [key, color] of Object.entries(Colors)) {
      for (const [key, name] of Object.entries(Names)) {
        this.push(new Card(name, color));
      }
    }
    this.shuffle();
  }

  shuffle() {
    return this.sort((a, b) => 0.5 - Math.random());
  }

  draw() {
    return this.shift();
  }
}
