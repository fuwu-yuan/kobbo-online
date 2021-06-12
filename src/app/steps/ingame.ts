import {Player} from "../models/player";
import {Card} from "../models/card";
import {Stock} from "../models/stock";
import {KobboConfig} from "../game/kobboConfig";
import {Board, Entity, GameStep, Entities} from "@fuwu-yuan/bgew";
import {Kobbo} from "../game/Kobbo";

export class InGameStep extends GameStep {
  name: string = "ingame";

  private stock: Stock;
  private gametable: Entities.Container;
  private spaces: any = {};

  constructor(board: Board) {
    super(board);
    this.stock = new Stock();
    this.gametable = new Entities.Container(0, 0, board.width, board.height);
  }

  onEnter(data: any): void {
    console.log("Entering InGame");
    console.log(Kobbo.players);
    this.initGame();
    this.initBoard();
    this.deal();
  }

  onLeave(): void {

  }

  initGame(): void {
    this.stock.initStock();
  }

  initBoard(): void {
    let spaceSize = {
      width: this.board.width/3,
      height: this.board.height/3
    };
    let spacePos = [
      { x: spaceSize.width, y: spaceSize.height*2 },
      { x: spaceSize.width, y: 0 },
      { x: 0, y: spaceSize.height },
      { x: spaceSize.width*2, y: spaceSize.height }
    ];

    for (const player of Kobbo.players) {
      let playerSpace = new Entities.Container(spacePos[player.index].x, spacePos[player.index].y, spaceSize.width, spaceSize.height);
      let background = new Entities.Square(0, 0, spaceSize.width, spaceSize.height, ["red", "blue", "green", "black"][player.index], "transparent");
      playerSpace.addEntity(background);
      this.spaces[player.index] = playerSpace;
      this.gametable.addEntity(playerSpace);
    }
    this.board.addEntity(this.gametable);
  }

  initBoardOld(): void {
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
    let playerIndex = 0;
    let cardId = 0;
    let interval = setInterval(() => {
      let card: Card = this.stock.draw();
      this.giveCardToPlayer(playerIndex, card);
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
    let player = Kobbo.players[i];
    console.log("Giving card to " + player.name);
    let playerSpace = this.spaces[i];
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

    let p = positions[Kobbo.players[i].cards.length];
    card.x = p.x;
    card.y = p.y;

    Kobbo.players[i].giveCard(card);
    playerSpace.addEntity(card);
    card.onMouseEvent("click", function(event: MouseEvent) {
      console.log("Click");
      card.showCard(!card.cardVisible);
    });
  }

  giveCardToPlayerOld(i: number, card: Card) {
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
