import {Board, Entities, GameStep} from "@fuwu-yuan/bgew";
import {adjectives, animals, colors, uniqueNamesGenerator} from 'unique-names-generator';
import {v4 as uuidv4} from 'uuid';
import {Kobbo} from "../game/Kobbo";
import {KobboConfig} from "../game/kobboConfig";

export class MainStep extends GameStep {
  name: string = "main";

  private background: Entities.Image;
  private onlineLabel: Entities.Label;
  private pingTimer = { current: 0, max: 10000 };
  private createButton: Entities.Button = new Entities.Button(0, 0, 0, 0);
  private joinButton: Entities.Button = new Entities.Button(0, 0, 0, 0);
  private nicknameinput: Entities.Inputtext;
  private versionLabel: Entities.Label;

  constructor(board: Board) {
    super(board);

    /** Background */
    this.background = new Entities.Image("./assets/images/background.jpg", 0, 0, this.board.config.board.size.width, this.board.config.board.size.height);

    /** Version Label */
    this.versionLabel = new Entities.Label(this.board.width, this.board.height, Kobbo.GAME_NAME + " v" + Kobbo.GAME_VERSION, board.ctx);
    this.versionLabel.fontSize = 12;
    this.versionLabel.x = this.versionLabel.x - this.versionLabel.width - 10;
    this.versionLabel.y = this.versionLabel.y - this.versionLabel.height - 10;
    this.versionLabel.fontColor = "#aaa";

    /** Online Label */
    this.onlineLabel = new Entities.Label(board.width - 70, 10, "", board.ctx);
    this.onlineLabel.fontSize = 14;

    /** Nickname */
    this.nicknameinput = new Entities.Inputtext(0, 0, 200, 50);
  }

  onEnter(): void {
    /*var url = window.location.href;
    var urlSplit = url.split( "?" );
    var stateObj = { Title : Kobbo.GAME_NAME, Url: urlSplit[0] };
    history.pushState(stateObj, stateObj.Title, stateObj.Url);*/

    KobboConfig.setDarkBackground();

    this.ping();

    Kobbo.players = [];
    Kobbo.playerIndex = -1;

    /** Create Button */
    let buttonSize = {width: 200, height: 60};
    this.createButton = new Button(
      this.board.config.board.size.width / 4 - buttonSize.width / 2,
      this.board.config.board.size.height / 2 - buttonSize.height / 2,
      buttonSize.width,
      buttonSize.height,
      "Créer une partie"
    );
    this.createButton.onMouseEvent("click", this.createGame);

    /** Join Button */
    this.joinButton = new Button(
      this.board.config.board.size.width / 4 * 3 - buttonSize.width / 2,
      this.board.config.board.size.height / 2 - buttonSize.height / 2,
      buttonSize.width,
      buttonSize.height,
      "Rejoindre une partie"
    );
    this.joinButton.onMouseEvent("click", this.joinGame);

    /** Background */
    this.board.addEntity(this.background);

    /** Black overlay */
    let overlay = new Entities.Rectangle(0, 0, this.board.width, this.board.height, "transparent", "rgba(0,0,0,0.5)");
    this.board.addEntity(overlay);

    /** Server status */
    let onlineLabelPrefix = new Entities.Label(this.board.width - 165, 10, "Le serveur est ", this.board.ctx);
    onlineLabelPrefix.fontColor = "#aaa";
    onlineLabelPrefix.fontSize = 14;

    /** Add nickname input */
    this.nicknameinput.x = this.board.width / 2 - this.nicknameinput.width / 2;
    this.nicknameinput.y = this.board.height / 2 - this.nicknameinput.width / 2 - 50;
    this.nicknameinput.text = "";
    this.nicknameinput.fillColor = "white";
    this.nicknameinput.strokeColor = "black";
    this.nicknameinput.placeholder = "Nickname";
    this.nicknameinput.fontColor = "black";
    this.nicknameinput.padding = { top: 0, bottom: 0, left: 5, right: 5 };
    if (KobboConfig.cookieService.hasKey("nickname")) {
      this.nicknameinput.text = KobboConfig.cookieService.get("nickname");
    }
    /*this.nicknameinput.text = uniqueNamesGenerator({
      dictionaries: [colors, animals],
      separator: '',
      length: 2,
      style: "capital"
    });*/
    let nicknameLabel = new Entities.Label(this.nicknameinput.x, this.nicknameinput.y, "Pseudo du joueur", this.board.ctx);
    nicknameLabel.x = this.nicknameinput.x + this.nicknameinput.width / 2 - nicknameLabel.width / 2
    nicknameLabel.y = nicknameLabel.y - nicknameLabel.height - 10;
    nicknameLabel.fontColor = "white";
    this.board.addEntity(nicknameLabel);
    this.board.addEntity(this.nicknameinput);

    this.board.addEntity(this.createButton);
    this.board.addEntity(this.joinButton);
    this.board.addEntity(onlineLabelPrefix);
    this.board.addEntity(this.onlineLabel);
    this.board.addEntity(this.versionLabel);
  }

  createGame = () => {
    KobboConfig.cookieService.put("nickname", this.nicknameinput.text);
    console.log("Creating game !");
    let defaultName: string = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      separator: ' ',
      length: 3,
    });
    defaultName = defaultName[0].toUpperCase() + defaultName.slice(1);
    let name = prompt("Nom de la partie", defaultName);
    if (name !== null) {
      let seed = uuidv4();
      this.board.networkManager.createRoom(name, 4, {seed: seed}, true)
        .then((res) => {
          console.log("Connecté et prêt !");
          this.board.moveToStep("waitingroom", Object.assign({}, res.data, { isHost: true, "nickname": this.nicknameinput.text }));
        })
        .catch((err) => {
          console.error("Error: ", err);
        });
    }
  }

  joinGame = () => {
    KobboConfig.cookieService.put("nickname", this.nicknameinput.text);
    console.log("Joining Game !");
    this.board.moveToStep("joingame", {nickname: this.nicknameinput.text});
  }

  onLeave(): void {
  }

  update(delta: number) {
    this.pingTimer.current += delta;
    if (this.pingTimer.current >= this.pingTimer.max) {
      this.pingTimer.current = 0;
      this.ping();
    }

    if (this.nicknameinput.text === "") {
      this.createButton.disabled = true;
      this.joinButton.disabled = true;
    }

    super.update(delta);
  }

  online() {
    this.onlineLabel.fontColor = "green";
    this.onlineLabel.text = "en ligne";
    if (this.nicknameinput.text !== "") {
      this.createButton.disabled = false;
      this.joinButton.disabled = false;
    }
  }

  offline() {
    this.onlineLabel.fontColor = "red";
    this.onlineLabel.text = "hors ligne";
    this.createButton.disabled = true;
    this.joinButton.disabled = true;
  }

  ping() {
    this.board.networkManager.ping().then((res) => {
      if (res === "pong") {
        this.online();
      }else {
        this.offline();
      }
    }).catch(() => {
      this.offline();
    })
  }
}

class Button extends Entities.Button {
  constructor(x: number, y: number, width: number, height: number, text: string = "") {
    super(x, y, width, height, text);
    // Normal
    this.strokeColor = "white";
    this.fontColor = "white";
    // Hover
    this.hoverFillColor = "white";
    this.hoverFontColor = "black";
    this.hoverCursor = "pointer";
    // Clicked
    this.clickStrokeColor = "lightgray";
    this.clickFillColor = "lightgray";
    this.clickFontColor = "black";
    // Disabled
    this.disabledStrokeColor = "darkgray";
    this.disabledFontColor = "darkgray";
  }
}
