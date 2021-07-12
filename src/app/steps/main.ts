import {Board, Entities, GameStep} from "@fuwu-yuan/bgew";
import {adjectives, animals, colors, Config, uniqueNamesGenerator} from 'unique-names-generator';
import { v4 as uuidv4 } from 'uuid';
import {Kobbo} from "../game/Kobbo";
import {MessagesService} from "../services/messages.service";

export class MainStep extends GameStep {
  name: string = "main";

  private onlineLabel: Entities.Label;
  private pingTimer = { current: 0, max: 1000 };
  private createButton: Entities.Button;
  private joinButton: Entities.Button;
  private nicknameinput: Entities.ExperimentalInputtext;
  private versionLabel: Entities.Label;

  constructor(board: Board) {
    super(board);

    /** Version Label */
    this.versionLabel = new Entities.Label(this.board.width, this.board.height, Kobbo.GAME_NAME + " v" + Kobbo.GAME_VERSION, board.ctx);
    this.versionLabel.fontSize = 12;
    this.versionLabel.x = this.versionLabel.x - this.versionLabel.width - 10;
    this.versionLabel.y = this.versionLabel.y - this.versionLabel.height - 10;
    this.versionLabel.fontColor = "#555";

    /** Online Label */
    this.onlineLabel = new Entities.Label(board.width - 70, 10, "", board.ctx);
    this.onlineLabel.fontSize = 14;

    let buttonSize = {width: 200, height: 60};
    /** Create Button */
    this.createButton = new Button(
      this.board.config.board.size.width / 4 - buttonSize.width / 2,
      this.board.config.board.size.height / 2 - buttonSize.height / 2,
      buttonSize.width,
      buttonSize.height,
      "Créer une partie"
    );
    this.createButton.onMouseEvent("click", this.createGame.bind(this));

    /** Join Button */
    this.joinButton = new Button(
      this.board.config.board.size.width / 4 * 3 - buttonSize.width / 2,
      this.board.config.board.size.height / 2 - buttonSize.height / 2,
      buttonSize.width,
      buttonSize.height,
      "Rejoindre une partie"
    );
    this.joinButton.onMouseEvent("click", this.joinGame.bind(this));

    /** Nickname */
    this.nicknameinput = new Entities.ExperimentalInputtext(0, 0, 200, 50);
  }

  onEnter(): void {
    this.pingTimer = { current: 0, max: 1000 };

    Kobbo.players = [];
    Kobbo.playerIndex = -1;

    let onlineLabelPrefix = new Entities.Label(this.board.width - 165, 10, "Le serveur est ", this.board.ctx);
    onlineLabelPrefix.fontColor = "black";
    onlineLabelPrefix.fontSize = 14;

    /** Add nickname input */
    this.nicknameinput.x = this.board.width / 2 - this.nicknameinput.width / 2;
    this.nicknameinput.y = this.board.height / 2 - this.nicknameinput.width / 2 - 50;
    this.nicknameinput.text = "";
    this.nicknameinput.fillColor = "white";
    this.nicknameinput.strokeColor = "black";
    this.nicknameinput.placeholder = "Nickname";
    this.nicknameinput.fontColor = "black";
    this.nicknameinput.text = uniqueNamesGenerator({
      dictionaries: [colors, animals],
      separator: '',
      length: 2,
      style: "capital"
    });
    let nicknameLabel = new Entities.Label(this.nicknameinput.x, this.nicknameinput.y, "Your nickname", this.board.ctx);
    nicknameLabel.y = nicknameLabel.y - nicknameLabel.height - 10;
    nicknameLabel.fontColor = "black";
    this.board.addEntity(nicknameLabel);
    this.board.addEntity(this.nicknameinput);

    this.board.addEntity(this.createButton);
    this.board.addEntity(this.joinButton);
    this.board.addEntity(onlineLabelPrefix);
    this.board.addEntity(this.onlineLabel);
    this.board.addEntity(this.versionLabel);
  }

  createGame() {
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

  joinGame() {
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

    super.update(delta);
  }

  online() {
    this.onlineLabel.fontColor = "green";
    this.onlineLabel.text = "en ligne";
    this.createButton.disabled = false;
    this.joinButton.disabled = false;
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
        this.offline()
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
    this.strokeColor = "rgba(230,77,59, 1.0)";
    this.fontColor = "rgba(230,77,59, 1.0)";
    // Hover
    this.hoverFillColor = "rgba(230,77,59, 1.0)";
    this.hoverFontColor = "white";
    this.hoverCursor = "pointer";
    // Clicked
    this.clickStrokeColor = "rgba(230,37,39, 1.0)";
    this.clickFillColor = "rgba(230,37,39, 1.0)";
    this.clickFontColor = "white";
    // Disabled
    this.disabledStrokeColor = "darkgray";
    this.disabledFontColor = "darkgray";
  }
}
