import {Board} from "./board";

export abstract class GameStep {
  abstract name: string;

  private _board: Board;

  constructor(board: Board) {
    this._board = board;
  }

  get board() {
    return this._board;
  }

  onNetworkMessage(msg: string) {}
  onPlayerJoin(data: any){}
  onConnectionClosed(){}

  abstract onEnter(data: any): void;
  abstract onLeave(): void;
}
