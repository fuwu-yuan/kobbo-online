import {Player} from "../models/player";
import {Board, Entities, GameStep, Network} from "@fuwu-yuan/bgew";
import {Kobbo} from "../game/Kobbo";
import {MessagesService} from "../services/messages.service";
import {KobboConfig} from "../game/kobboConfig";

const GAME_START_TIMER = 5; //seconds
const GAMETABLE_PADDING = 64;

export class WaitingRoomStep extends GameStep {
  name: string = "waitingroom";

  private background: Entities.Image;
  private images: HTMLImageElement[] = [];
  private imagesEntities: any[] = [null, null, null, null];

  private startButton: Entities.Button|null = null;
  private readyButton: Entities.Button|null = null;

  private playerNicknames: Entities.Label[] = [];

  private messagesService;

  private data: any;
  private startCounter: number = -1;

  constructor(board: Board) {
    super(board);
    this.background = new Entities.Image(0, 0, this.board.config.board.size.width, this.board.config.board.size.height, "./assets/images/background.jpg");
    this.messagesService = MessagesService.getInstance();

    for (let i = 0; i < 4; i++) {
      this.playerNicknames.push(new Entities.Label(0, 0, "", board.ctx));
    }
  }

  onEnter(data: any): void {
    KobboConfig.setDarkBackground();
    console.log("Enter: ", data);
    this.data = data;
    const self = this;

    /** Add background */
    this.board.addEntity(this.background);
    /** Black overlay */
    let overlay = new Entities.Square(0, 0, this.board.width, this.board.height, "transparent", "rgba(0,0,0,0.5)");
    this.board.addEntity(overlay);


    this.board.addEntities(this.playerNicknames);

    /** Set game URL */
    /*var url = window.location.href;
    var urlSplit = url.split( "?" );
    var stateObj = { Title : data.room.name, Url: urlSplit[0] + "?game="+data.room.uid};
    history.pushState(stateObj, stateObj.Title, stateObj.Url);*/

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

  onMessageSent = (message: string) => {
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
    button.strokeColor = "white";
    button.fontColor = "white";
    // Hover
    button.hoverStrokeColor = "black";
    button.hoverFillColor = "white";
    button.hoverFontColor = "black";
    button.hoverCursor = "pointer";
    // Click
    button.clickStrokeColor = "black";
    button.clickFillColor = "#eee"
    button.clickFontColor = "black";
    if (Kobbo.player.isHost) {
      this.startButton = Object.create(button) as Entities.Button;
      this.startButton.text = "En attente des autres joueurs";
      this.startButton.disabled = true;
      this.startButton.onMouseEvent("click", (event: MouseEvent) => {
        if (this.startButton) {
          // Le compteur n'a pas d??marr??
          if (this.startCounter === -1) {
            let cnt = GAME_START_TIMER;
            this.startButton.text = "Annuler";
            this.startCounter = setInterval(() => {
              if (cnt === 0) {
                clearInterval(this.startCounter);
                this.startCounter = -1;
                this.board.networkManager.sendMessage({start: "start"}).then(() => {
                  this.board.moveToStep("ingame", this.data);
                });
              }else {
                this.board.networkManager.sendMessage({start: cnt}).then(() => {
                  this.messagesService.add("Kobbo", "D??but de la partie dans "+cnt+" seconde" + (cnt>1?"s":""), true);
                  cnt--;
                });
              }
            }, 1000);
          }else {
            this.startButton.text = "D??marrer la partie";
            clearInterval(this.startCounter);
            this.startCounter = -1;
            this.board.networkManager.sendMessage({start: "abort"}).then(() => {
              this.messagesService.add("Kobbo", "D??marrage annul??.", true);
            });
          }
        }
      });
      this.board.addEntity(this.startButton);
    }else {
      this.readyButton = Object.create(button) as Entities.Button;
      this.readyButton.text = "Je suis pr??t";
      this.readyButton.onMouseEvent("click", (event: MouseEvent) => {
        this.board.networkManager.sendMessage({ready: !Kobbo.player.ready}).then((res) => {
          Kobbo.player.ready = !Kobbo.player.ready;
          this.messagesService.add("Kobbo", Kobbo.player.ready ? "Vous ??tes pr??t !" : "Vous n'??tes pas pr??t !", true);
          if (this.readyButton) {
            if (Kobbo.player.ready) {
              this.readyButton.text = "Je ne suis pas pr??t";
            }else {
              this.readyButton.text = "Je suis pr??t";
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
        this.messagesService.add("Kobbo", player.name + (player.ready ? " est pr??t" : " n'est pas pr??t") + ".", true);
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
              this.startButton.text = "D??marrer la partie";
              this.startButton.disabled = false;
            }else {
              this.startButton.text = "En attente des autres joueurs";
              this.startButton.disabled = true;
              if (this.startCounter !== -1) {
                clearInterval(this.startCounter);
                this.startCounter = -1;
              }
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
        this.messagesService.add("Kobbo", player.name + " ?? rejoint la partie.", true);
      }
    }

    /* Game start */
    if ("start" in message.data.msg) {
      if (message.data.msg.start === "start") {
        this.board.moveToStep("ingame", this.data);
      }else if (message.data.msg.start === "abort") {
        this.messagesService.add("Kobbo", "D??marrage annul??.", true);
      }else {
        let sec = parseInt(message.data.msg.start);
        this.messagesService.add("Kobbo", "D??but de la partie dans "+sec+" seconde" + (sec>1?"s":""), true);
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
      this.messagesService.add("Kobbo", player.name + " ?? quitt?? la partie.", true);
      this.board.removeEntity(this.imagesEntities[player.index]);
      this.imagesEntities[player.index] = null;
      Kobbo.players.splice(index, 1);
      console.log(Kobbo.player.isHost);
      if (Kobbo.player.isHost) {
        this.board.networkManager.setRoomData({players: Kobbo.players}, false).then((response: Network.Response) => {
          this.data = response.data;
        });
      }
      if (this.startCounter !== -1) {
        clearInterval(this.startCounter);
        this.startCounter = -1;
      }
    }
  }

  onConnectionClosed() {
    alert("La connexion avec le serveur a ??t?? perdue.");
    this.board.moveToStep("main");
  }

  addPlayer(player: Player): Player {
    console.log("Adding new player: " + player.uid);
    Kobbo.players.push(player);
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
    let players = Kobbo.sortedPlayers();
    let labelPos = [
      { x: this.board.width / 2/* - label.width / 2*/, y: this.board.height - GAMETABLE_PADDING / 2 /* - label.height / 2*/, deg: 0 },
      { x: GAMETABLE_PADDING / 2/* - label.width / 2*/, y: this.board.height / 2/* - label.height / 2*/, deg: 270 },
      { x: this.board.width / 2/* - label.width / 2*/, y: GAMETABLE_PADDING / 2/* - label.height / 2*/, deg: 0 },
      { x: this.board.width - GAMETABLE_PADDING / 2/* - label.width / 2*/, y: this.board.height / 2/* - label.height / 2*/, deg: 90 }
    ];

    if (players.length === 2) {
      labelPos = [labelPos[0], labelPos[2], labelPos[1], labelPos[3]];
    }
    for (let i = 0; i < this.playerNicknames.length; i++) {
      let label = this.playerNicknames[i];
      if (typeof players[i] !== "undefined") {
        label.text = (players[i].ready ? "??? " : "??? ") + players[i].name;
        label.fontColor = "white";
      }else {
        label.text = "En attente d'un joueur";
        label.fontColor = "gray";
      }
      label.x = labelPos[i].x - label.width / 2;
      label.y = labelPos[i].y - label.height / 2;
      label.rotate = labelPos[i].deg;
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
