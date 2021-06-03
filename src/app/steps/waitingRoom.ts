import {Player} from "../models/player";
import {Board, Entity, GameStep} from "@fuwu-yuan/bgew";

export class WaitingRoomStep extends GameStep {
  name: string = "waitingroom";

  private background: HTMLImageElement;
  private images: HTMLImageElement[] = [];
  private players: any[] = [null, null, null, null];
  private imagesEntities: any[] = [null, null, null, null];

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

  onEnter(data: any): void {
    console.log(data);
    let self = this;

    let background = new class extends Entity {
      draw(ctx: CanvasRenderingContext2D): void { this.board?.ctx.drawImage(self.background, 0, 0, this.board.config.board.size.width, this.board.config.board.size.height); }
      update(): void {}
    }(0, 0, this.board.config.board.size.width, this.board.config.board.size.height);

    this.board.addEntity(background);
    for (let i = 0; i < data.players.length; i++) {
      this.addPlayer(data.players[i].uid, "Player"+i);
    }
    /*setTimeout(function() {
      self.board.networkManager.joinRoom(self.board.networkManager.roomuid).then(() => {
        console.log("Join again");
      }).catch(() => {
        console.log("Fail to join again");
      });
    }, 3000);*/
  }


  onNetworkMessage(msg: any) {
    //TODO
  }

  onPlayerJoin(msg: any) {
    console.log("Player joined: ", msg);
    this.addPlayer(msg.sender, "Player"+(this.players.length+1));
  }

  onPlayerLeave(msg: any) {
    console.log("Player left: ", msg);
    let index = this.players.findIndex(function(player: Player) {
      return player && player.uid === msg.sender;
    });
    if (index > -1) {
      this.board.removeEntity(this.imagesEntities[index]);
      this.imagesEntities[index] = null;
      this.players[index] = null;
    }
  }

  onConnectionClosed() {
    alert("La connexion avec le serveur a été perdue.");
    this.board.moveToStep("main");
  }

  addPlayer(uid:string, name: string) {
    console.log("Adding new player: " + uid);
    let self = this;
    let index = this.players.indexOf(null);
    console.log(index);
    this.players[index] = new Player(uid, name);
    let entity = new class extends Entity {
      private readonly image;
      constructor(x: number, y: number, width: number, height: number, image: HTMLImageElement) {
        super(x, y, width, height);
        this.image = image;
      }
      draw(ctx: CanvasRenderingContext2D): void {
        this.board?.ctx.drawImage(this.image, 0, 0, this.board.config.board.size.width, this.board.config.board.size.height);
      }
      update(): void {}
    }(0, 0, this.board.config.board.size.width, this.board.config.board.size.height, self.images[index]);
    this.imagesEntities[index] = entity;
    this.board.addEntity(entity);
  }

  onLeave(): void {

  }
}
