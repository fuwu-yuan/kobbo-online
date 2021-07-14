import {Player} from "../models/player";
import {Board, Entity, GameStep, Network, Entities} from "@fuwu-yuan/bgew";
import {Kobbo} from "../game/Kobbo";
import {MessagesService} from "../services/messages.service";

export class WaitingRoomStep extends GameStep {
  name: string = "waitingroom";

  private background: HTMLImageElement;
  private images: HTMLImageElement[] = [];
  private imagesEntities: any[] = [null, null, null, null];

  private startButton: Entities.Button|null = null;
  private readyButton: Entities.Button|null = null;
  private readyPlayersLabel: Entities.Label|null = null;

  private messagesService;

  private data: any;

  constructor(board: Board) {
    super(board);
    this.background = new Image();
    this.background.src = "./assets/images/creategame/background.jpg";
    let cardsP1 = new Image();
    //cardsP1.src = "/assets/images/creategame/p1.png";
    this.images.push(cardsP1);
    let cardsP2 = new Image();
    //cardsP2.src = "/assets/images/creategame/p2.png";
    this.images.push(cardsP2);
    let cardsP3 = new Image();
    //cardsP3.src = "/assets/images/creategame/p3.png";
    this.images.push(cardsP3);
    let cardsP4 = new Image();
    //cardsP4.src = "/assets/images/creategame/p4.png";
    this.images.push(cardsP4);

    this.messagesService = MessagesService.getInstance();
  }

  onEnter(data: any): void {
    this.readyPlayersLabel = new Entities.Label(10, 10, "", this.board.ctx);
    console.log("Enter: ", data);
    this.data = data;
    const self = this;

    /** Add background */
    let background = new class extends Entity {
      draw(ctx: CanvasRenderingContext2D): void { this.board?.ctx.drawImage(self.background, 0, 0, this.board.config.board.size.width, this.board.config.board.size.height); }
      update(): void {}
    }(0, 0, this.board.config.board.size.width, this.board.config.board.size.height);
    this.board.addEntity(background);
    this.board.addEntity(this.readyPlayersLabel);

    /** Add all existing players */
    if (data.room.data.players) {
      for (let i = 0; i < data.room.data.players.length; i++) {
        this.addPlayer(Player.fromObject(data.room.data.players[i]));
      }
    }

    /** Init chat */
    this.initChat();

    /** Create player locally */
    let index = this.getFreeIndex();
    let player = new Player(index, data.uid, data.nickname);
    Kobbo.player = this.addPlayer(player);
    Kobbo.player.isHost = data.isHost;
    Kobbo.player.ready = data.isHost;

    this.messagesService.add("Kobbo", "Bienvenue dans la partie '" + data.room.name + "' " + data.nickname, true);

    /** Add player to server data and update player list */
    this.board.networkManager.setRoomData({players: [JSON.parse(JSON.stringify(Kobbo.player))]}, true)
      .then((response: Network.Response) => {
        this.data = response.data;
      });

    /** Add control buttons */
    this.addControlButtons();

    /** Send nickname to other players */
    this.board.networkManager.sendMessage({nickname: data.nickname});
  }

  initChat() {
    this.messagesService.show();
    this.messagesService.onMessageSent(this.onMessageSent);
  }

  onMessageSent(message: string) {
    this.board.networkManager.sendMessage({
      action: "chat",
      data: {
        username: Kobbo.player.name,
        message: message
      }
    }).then((response: Network.SocketMessage) => {
      this.messagesService.add(Kobbo.player.name, message);
    });
  }

  addControlButtons() {
    var size = {width: 300, height: 60};
    let button = new Entities.Button(
      this.board.width/2 - size.width/2,
      this.board.height/2 - size.height/2,
      size.width,
      size.height
    );
    button.strokeColor = "black";
    button.fillColor = "white";
    button.fontColor = "black";
    button.hoverStrokeColor = "white";
    button.hoverFillColor = "black";
    button.hoverFontColor = "white";
    button.clickFillColor = "darkgray";
    button.hoverCursor = "pointer";
    if (Kobbo.player.isHost) {
      this.startButton = Object.create(button) as Entities.Button;
      this.startButton.text = "En attente des autres joueurs";
      this.startButton.disabled = true;
      this.startButton.onMouseEvent("click", (event: MouseEvent) => {
        this.board.networkManager.sendMessage({start: true}).then(() => {
          this.board.moveToStep("ingame", this.data);
        });
      });
      this.board.addEntity(this.startButton);
    }else {
      this.readyButton = Object.create(button) as Entities.Button;
      this.readyButton.text = "Je suis prêt";
      this.readyButton.onMouseEvent("click", (event: MouseEvent) => {
        this.board.networkManager.sendMessage({ready: !Kobbo.player.ready}).then((res) => {
          Kobbo.player.ready = !Kobbo.player.ready;
          this.messagesService.add("Kobbo", Kobbo.player.ready ? "Vous êtes prêt !" : "Vous n'êtes pas prêt !", true);
          if (this.readyButton) {
            if (Kobbo.player.ready) {
              this.readyButton.text = "Je ne suis pas prêt";
            }else {
              this.readyButton.text = "Je suis prêt";
            }
          }
        });
      });
      this.board.addEntity(this.readyButton);
    }
  }

  onNetworkMessage(message: Network.SocketMessage) {
    console.log("Message received: ", message);

    if (message.data.msg.action) {
      switch (message.data.msg.action) {
        case "chat":
          let username = message.data.msg.data.username;
          let msg = message.data.msg.data.message;
          this.messagesService.add(username, msg);
          break;
      }
    }

    /* A player is ready */
    if ("ready" in message.data.msg) {
      let player = Kobbo.players.find((p) => {
        return p.uid === message.sender;
      });
      if (player) {
        player.ready = message.data.msg.ready;
        console.log("Player " + message.sender + " is " + (player.ready ? "" : "NOT ") + "ready");
        this.messagesService.add("Kobbo", player.name + (player.ready ? " est prêt" : " n'est pas prêt") + ".", true);
        if (Kobbo.player.isHost) {
          this.board.networkManager.setRoomData({players: Kobbo.players}, false).then((response: Network.Response) => {
            this.data = response.data;
          });
          let readyPlayers = Kobbo.players.filter((p) => {
            return p && p.ready;
          });
          console.log(readyPlayers.length + "/" + Kobbo.players.length + " players are ready");
          if (this.startButton) {
            if (Kobbo.players.length === readyPlayers.length) {
              console.log("All players are ready !");
              this.startButton.text = "Démarrer la partie";
              this.startButton.disabled = false;
            }else {
              this.startButton.text = "En attente des autres joueurs";
              this.startButton.disabled = true;
            }
          }
        }
      }
    }

    /* Nickname */
    if ("nickname" in message.data.msg) {
      let player = Kobbo.findPlayerByUid(message.sender);
      if (player) {
        player.name = message.data.msg.nickname;
        this.messagesService.add("Kobbo", player.name + " à rejoint la partie.", true);
      }
    }

    /* Game start */
    if ("start" in message.data.msg) {
      if (message.data.msg.start) {
        this.board.moveToStep("ingame", this.data);
      }
    }
  }

  onPlayerJoin(msg: any) {
    console.log("Player joined: ", msg);

    /** Create player locally */
    let index = this.getFreeIndex();
    let player = new Player(index, msg.sender, "Player " + (index+1));
    this.addPlayer(player);
  }

  onPlayerLeave(msg: any) {
    console.log("Player left: ", msg);
    let index = Kobbo.players.findIndex(function(player: Player) {
      return player.uid === msg.sender;
    });
    if (index > -1) {
      let player = Kobbo.players[index];
      this.messagesService.add("Kobbo", player.name + " à quitté la partie.", true);
      this.board.removeEntity(this.imagesEntities[player.index]);
      this.imagesEntities[player.index] = null;
      Kobbo.players.splice(index, 1);
      console.log(Kobbo.player.isHost);
      if (Kobbo.player.isHost) {
        this.board.networkManager.setRoomData({players: Kobbo.players}, false).then((response: Network.Response) => {
          this.data = response.data;
        });
      }
    }
  }

  onConnectionClosed() {
    alert("La connexion avec le serveur a été perdue.");
    this.board.moveToStep("main");
  }

  addPlayer(player: Player): Player {
    console.log("Adding new player: " + player.uid);
    let self = this;
    Kobbo.players.push(player);
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
    }(0, 0, this.board.config.board.size.width, this.board.config.board.size.height, self.images[player.index]);
    this.imagesEntities[player.index] = entity;
    this.board.addEntity(entity);

    return player;
  }

  update(delta: number) {
    super.update(delta);
    this.updatePlayersReadyLabel();
  }

  onLeave(): void {
    console.log("Leaving waiting room");
    this.messagesService.offMessageSent(this.onMessageSent);
    this.messagesService.clear();
  }

  private updatePlayersReadyLabel() {
    if (this.readyPlayersLabel) {
      this.readyPlayersLabel.text = "";
      let players = Kobbo.players.sort((p1: Player, p2: Player) => {
        return p1.index - p2.index;
      })
      for (let i = 0; i < players.length; i++) {
        this.readyPlayersLabel.text = this.readyPlayersLabel.text + (players[i].ready ? "✅ " : "❌ ") + players[i].name + "\n\n";
      }
    }
  }

  private getFreeIndex() {
    let freeIndex = -1;
    for (let i = 0; i <= Kobbo.players.length; i++) {
      let found = typeof Kobbo.players.find(p => p.index === i) !== 'undefined';
      if (!found) {
        freeIndex = i;
      }
    }
    return freeIndex;
  }
}
