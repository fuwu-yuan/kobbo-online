import {Board, Network} from "@fuwu-yuan/bgew";
import {Kobbo} from "./Kobbo";
import {Player} from "../models/player";

export class ServerSide {
  private board: Board;
  private currentPlayer: Player|null = null;

  constructor(board: Board) {
    this.board = board;

  }

  nextPlayer(): Promise<Network.SocketMessage> {
    let i = 0;
    if (this.currentPlayer !== null) {
      i = Kobbo.players.findIndex((p: Player) => { return p.uid === this.currentPlayer?.uid } ) + 1;
      if (i === Kobbo.players.length) {
        i = 0;
      }
    }
    this.currentPlayer = Kobbo.sortedPlayers()[i];

    return this.board.networkManager.sendMessage({
      event: "next_player",
      data: {player: this.currentPlayer.uid}
    });
  }
}
