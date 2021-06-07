import {Player} from "../models/player";
import {Card} from "../models/card";
import {Stock} from "../models/stock";
import {KobboConfig} from "../game/kobboConfig";
import {Board, Entity, GameStep} from "@fuwu-yuan/bgew";
import {Kobbo} from "../game/Kobbo";

export class InGameStep extends GameStep {
  name: string = "ingame";

  private stock: Stock;

  constructor(board: Board) {
    super(board);
    this.stock = new Stock();
  }

  onEnter(data: any): void {
    console.log("Entering InGame");
    console.log(Kobbo.players);
    this.initGame();
    //this.initBoard();
    this.deal();
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

  deal(): void {
    let self = this;
    let playerIndex = 0;
    let cardId = 0;
    let interval = setInterval(function() {
      let card: Card = self.stock.draw();
      self.giveCardToPlayer(playerIndex, card);
      playerIndex++;
      if (playerIndex === Kobbo.players.length) {
        playerIndex = 0;
        cardId++;
      }
      if (playerIndex === 0 && cardId == Kobbo.players.length) {
        clearInterval(interval)
      }
    }, 500);
  }

  giveCardToPlayer(i: number, card: Card) {
    let playerSpace = {
      width: this.board.config.board.size.width/2,
      height: this.board.config.board.size.height/2
    };

    Kobbo.players[i].giveCard(card);
    card.width = KobboConfig.cards.size.width;
    card.height = KobboConfig.cards.size.height;
    card.x = (playerSpace.width/2)-(playerSpace.width/4*(([1, 3].includes(Kobbo.players[i].cards.length) ? 1 : -1)))-card.width/2;
    card.y = (playerSpace.height/2)-(playerSpace.height/4*((Kobbo.players[i].cards.length > 2 ? -1 : 1)))-card.height/2;
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
