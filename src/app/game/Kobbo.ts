import {Player} from "../models/player";
import {Card} from "../models/card";
import {Entities} from "@fuwu-yuan/bgew";

export class Kobbo {

  public static playerIndex = -1;
  public static players: Player[] = [];
  public static player: Player;

  public static GAME_NAME: string = "Kobbo - Meilleur jeu de cartes";
  public static GAME_VERSION = "0.0.3";

  public static sortedPlayers() {
    return Kobbo.players.sort((p1: Player, p2: Player) => {
      return p1.index - p2.index;
    });
  }

  public static findPlayerByUid(uid: string) {
    return Kobbo.players.find(function(p: Player) {
      return p.uid === uid;
    });
  }

  public static removePlayer(player: Player): number {
    let i = Kobbo.players.indexOf(player);
    Kobbo.players.splice(i, 1);
    return i;
  }

}
