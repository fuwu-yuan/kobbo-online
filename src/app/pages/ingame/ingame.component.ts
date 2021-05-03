import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {StockService} from "../../services/stock.service";
import {Card} from "../../models/card";
import {Player} from "../../models/player";
import {Config} from "../../services/config.service";
import {Board} from "../../models/board";
import {Entity} from "../../models/entity";

@Component({
  selector: 'app-ingame',
  templateUrl: './ingame.component.html',
  styleUrls: ['./ingame.component.sass']
})
export class IngameComponent implements OnInit {

  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  board: Board|null = null;

  private players: Player[];

  constructor(
    private stockService: StockService,
    private config: Config
  ) {
    this.players = [];
  }

  ngOnInit(): void {
    this.board = new Board(this.canvas, this.config);
    this.stockService.initStock();
    this.initGame();
    this.board.start();
  }

  initGame(): void {
    for (let i = 0; i < this.config.nbPlayers; i++) {
      this.players.push(new Player(i, "Player" + i, this.config));
    }
  }

  giveCardToPlayer(i: number, card: Card) {
    let self = this;
    let playerSpace = {
      width: this.config.board.size.width/2,
      height: this.config.board.size.height/2
    };

    this.players[i].giveCard(card);
    card.width = this.config.cards.size.width;
    card.height = this.config.cards.size.height;
    card.x = (playerSpace.width/2)-(playerSpace.width/4*(([1, 3].includes(self.players[i].cards.length) ? 1 : -1)))-card.width/2;
    card.y = (playerSpace.height/2)-(playerSpace.height/4*((self.players[i].cards.length > 2 ? -1 : 1)))-card.height/2;
    card.translate = {
      x: (i%2) * (this.config.board.size.width / 2),
      y: (i > 1 ? 1 : 0) * (this.config.board.size.height / 2)
    };
    if (this.board) {
      this.board.addEntity(card);
      card.onMouseEvent("click", function(event: MouseEvent) {
        const x = event.clientX;
        const y = event.clientY;
        console.log("x: "+ x + " | y" + y)
        card.showCard(!card.visible);
      });
    }
  }

  initBoard(): void {
    let self = this;
    if (this.board) {
      this.board.addEntity(new class extends Entity {
        draw(ctx: CanvasRenderingContext2D) {
          // Vertical line
          ctx.moveTo(self.config.board.size.width / 2, 0);
          ctx.lineTo(self.config.board.size.width / 2, self.config.board.size.height);
          ctx.stroke();
          // Horizontal line
          ctx.moveTo(0, self.config.board.size.height / 2);
          ctx.lineTo(self.config.board.size.width, self.config.board.size.height / 2);
          ctx.stroke();
        }
      }(0, 0, self.config.board.size.width, self.config.board.size.height));
    }
  }

  startRound(): void {
    this.initBoard();

    let self = this;
    let playerId = 0;
    let cardId = 0;
    let interval = setInterval(function() {
      let card: Card = self.stockService.draw();
      self.giveCardToPlayer(playerId, card);
      playerId++;
      if (playerId === self.config.nbPlayers) {
        playerId = 0;
        cardId++;
      }
      if (playerId === self.config.nbPlayers && cardId == 4) {
        clearInterval(interval)
      }
    }, 500);
  }
}
