import {Board} from "./board";
import {Entity} from "./entity";
import {SocketMessage} from "./network/socketMessage";

export abstract class GameStep {
  abstract name: string;

  private _board: Board;

  constructor(board: Board) {
    this._board = board;
  }

  get board() {
    return this._board;
  }

  onNetworkMessage(msg: SocketMessage) {}
  onPlayerJoin(msg: SocketMessage){}
  onPlayerLeave(msg: SocketMessage){}
  onConnectionClosed(){}

  abstract onEnter(data: any): void;
  abstract onLeave(): void;

  /**
   * Game update loop
   */
  update(delta: number) {
    if (this.board.canvas && this.board.ctx) {
      this.board.entities.forEach(function(entity: Entity) {
        entity.update(delta);
      });
    }
  }

  /**
   * Game draw loop
   */
  draw() {
    let self = this;
    if (this.board.canvas) {
      /* Clear canvas */
      this.board.ctx.clearRect(0, 0, this.board.canvas.width, this.board.canvas.height);
      this.board.clear();
      this.board.entities.forEach(function(entity: Entity) {
        if (entity.visible) {
          self.board.resetStyles();
          self.board.ctx.save();
          self.board.ctx.translate(entity.translate.x, entity.translate.y);
          entity.draw(self.board.ctx as CanvasRenderingContext2D);
          self.board.ctx.restore();
        }
      });
    }
  }
}
