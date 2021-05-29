import {GameStep} from "../engine/gamestep";
import {Button} from "../models/button";
import {Entity} from "../engine/entity";
import {Board} from "../engine/board";

export class JoinGameStep extends GameStep {
  name: string = "join_game";

  private background: HTMLImageElement;

  constructor(board: Board) {
    super(board);
    this.background = new Image();
    this.background.src = "./assets/images/creategame/background.jpg";
  }

  onEnter(): void {
    let self = this;

    let background = new class extends Entity {
      draw(ctx: CanvasRenderingContext2D): void { this.board?.ctx.drawImage(self.background, 0, 0, this.board.config.board.size.width, this.board.config.board.size.height); }
      update(): void {}
    }(0, 0, this.board.config.board.size.width, this.board.config.board.size.height);
    let title = new class extends Entity {
      draw(ctx: CanvasRenderingContext2D): void {

      }
      update(): void {}
    }(0, 0, this.board.config.board.size.width, this.board.config.board.size.height);

    this.board.addEntity(background);
  }

  onLeave(): void {

  }
}
