import {GameStep} from "../engine/gamestep";
import {Player} from "../models/player";
import {Card} from "../models/card";
import {Entity} from "../engine/entity";
import {Board} from "../engine/board";
import {Stock} from "../models/stock";
import {KobboConfig} from "../game/kobboConfig";

export class InGameStep extends GameStep {
  name: string = "ingame";

  private stock: Stock;
  private players: Player[] = [];

  constructor(board: Board) {
    super(board);
    this.stock = new Stock();
  }

  onEnter(data: any): void {
    console.log("Entering InGame");
    this.players = data.players;
    this.initGame();
    this.initBoard();
    this.startRound();
  }

  onLeave(): void {

  }

  initGame(): void {
    this.stock.initStock();
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
      let card: Card = self.stock.draw();
      self.giveCardToPlayer(playerId, card);
      playerId++;
      if (playerId === self.players.length) {
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
    card.width = KobboConfig.cards.size.width;
    card.height = KobboConfig.cards.size.height;
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
        card.showCard(!card.cardVisible);
      });
    }
  }
}
