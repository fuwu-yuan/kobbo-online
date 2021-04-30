import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {StockService} from "../../services/stock.service";
import {Card} from "../../models/card";

@Component({
  selector: 'app-ingame',
  templateUrl: './ingame.component.html',
  styleUrls: ['./ingame.component.sass']
})
export class IngameComponent implements OnInit {

  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  private ctx?: CanvasRenderingContext2D | null;
  private test = 0;

  constructor(
    private stockService: StockService
  ) {

  }

  ngOnInit(): void {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.stockService.initStock();
  }

  drawACard(): void {
    let card: Card = this.stockService.draw();
    let image = card.image;
    if (this.ctx) {
      this.ctx.drawImage(image, 0, this.test, 140, 190);
    }
    this.test += 50;
  }
}
