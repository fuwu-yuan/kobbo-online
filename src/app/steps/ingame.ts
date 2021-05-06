import {GameStep} from "../engine/gamestep";
import {Button} from "../models/button";
import {Player} from "../models/player";
import {Card} from "../models/card";
import {Entity} from "../engine/entity";
import {Board} from "../engine/board";
import {StockService} from "../services/stock.service";

export class InGameStep extends GameStep {
  name: string = "ingame";

  private stockService: StockService;

  private players: Player[] = [];

  constructor(board: Board, stockService: StockService) {
    super(board);
    this.stockService = stockService;
  }

  onEnter(): void {
    console.log("Entering InGame");
    this.initGame();
    this.initBoard();
    this.startRound();
  }

  onLeave(): void {

  }

  initGame(): void {
    this.stockService.initStock();
    for (let i = 0; i < this.board.config.nbPlayers; i++) {
      this.players.push(new Player(i, "Player" + i, this.board.config));
    }
  }

  initBoard(): void {
    let self = this;
    if (this.board) {
      this.board.addEntity(new class extends Entity {
        draw(ctx: CanvasRenderingContext2D) {
          // Vertical line
          ctx.moveTo(self.board.config.board.size.width / 2, 0);
          ctx.lineTo(self.board.config.board.size.width / 2, self.board.config.board.size.height);
          ctx.stroke();
          // Horizontal line
          ctx.moveTo(0, self.board.config.board.size.height / 2);
          ctx.lineTo(self.board.config.board.size.width, self.board.config.board.size.height / 2);
          ctx.stroke();
        }
        update() {}
      }(0, 0, self.board.config.board.size.width, self.board.config.board.size.height));
    }
  }

  startRound(): void {
    let self = this;
    let playerId = 0;
    let cardId = 0;
    let interval = setInterval(function() {
      let card: Card = self.stockService.draw();
      self.giveCardToPlayer(playerId, card);
      playerId++;
      if (playerId === self.board.config.nbPlayers) {
        playerId = 0;
        cardId++;
      }
      if (playerId === 0 && cardId == 4) {
        clearInterval(interval)
      }
    }, 500);
  }

  giveCardToPlayer(i: number, card: Card) {
    let self = this;
    let playerSpace = {
      width: this.board.config.board.size.width/2,
      height: this.board.config.board.size.height/2
    };

    this.players[i].giveCard(card);
    card.width = this.board.config.cards.size.width;
    card.height = this.board.config.cards.size.height;
    card.x = (playerSpace.width/2)-(playerSpace.width/4*(([1, 3].includes(self.players[i].cards.length) ? 1 : -1)))-card.width/2;
    card.y = (playerSpace.height/2)-(playerSpace.height/4*((self.players[i].cards.length > 2 ? -1 : 1)))-card.height/2;
    card.translate = {
      x: (i%2) * (this.board.config.board.size.width / 2),
      y: (i > 1 ? 1 : 0) * (this.board.config.board.size.height / 2)
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
}
