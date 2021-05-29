import {GameStep} from "../engine/gamestep";
import {Button} from "../models/button";
import {Entity} from "../engine/entity";
import {Board} from "../engine/board";
import {Player} from "../models/player";

export class CreateGameStep extends GameStep {
  name: string = "create_game";

  private background: HTMLImageElement;
  private images: HTMLImageElement[] = [];
  private players: any[] = [];

  constructor(board: Board) {
    super(board);
    this.background = new Image();
    this.background.src = "./assets/images/creategame/background.jpg";
    let cardsP1 = new Image();
    cardsP1.src = "/assets/images/creategame/p1.png";
    this.images.push(cardsP1);
    let cardsP2 = new Image();
    cardsP2.src = "/assets/images/creategame/p2.png";
    this.images.push(cardsP2);
    let cardsP3 = new Image();
    cardsP3.src = "/assets/images/creategame/p3.png";
    this.images.push(cardsP3);
    let cardsP4 = new Image();
    cardsP4.src = "/assets/images/creategame/p4.png";
    this.images.push(cardsP4);
  }

  onEnter(): void {
    let self = this;

    let background = new class extends Entity {
      draw(ctx: CanvasRenderingContext2D): void { this.board?.ctx.drawImage(self.background, 0, 0, this.board.config.board.size.width, this.board.config.board.size.height); }
      update(): void {}
    }(0, 0, this.board.config.board.size.width, this.board.config.board.size.height);

    this.board.addEntity(background);
    this.addPlayer("Player1");
    /*setTimeout(function() {
      self.board.networkManager.joinRoom(self.board.networkManager.roomuid).then(() => {
        console.log("Join again");
      }).catch(() => {
        console.log("Fail to join again");
      });
    }, 3000);*/
  }


  onNetworkMessage(msg: string) {
    //TODO
  }

  onPlayerJoin(data: any) {
    this.addPlayer("Player"+(this.players.length+1));
  }

  onConnectionClosed() {
    alert("Connection closed !");
  }

  addPlayer(name: string) {
    console.log("Adding new player");
    let self = this;
    this.players.push(new Player(this.players.length, name));
    this.board.addEntity(new class extends Entity {
      private readonly image;
      constructor(x: number, y: number, width: number, height: number, image: HTMLImageElement) {
        super(x, y, width, height);
        this.image = image;
      }
      draw(ctx: CanvasRenderingContext2D): void {
        this.board?.ctx.drawImage(this.image, 0, 0, this.board.config.board.size.width, this.board.config.board.size.height);
      }
      update(): void {}
    }(0, 0, this.board.config.board.size.width, this.board.config.board.size.height, self.images[self.players.length-1]))
  }

  onLeave(): void {

  }
}
