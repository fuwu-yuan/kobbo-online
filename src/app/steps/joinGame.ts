import {GameStep} from "../engine/gamestep";
import {Button} from "../models/button";
import {Entity} from "../engine/entity";
import {Board} from "../engine/board";
import {Label} from "../models/label";
import {Square} from "../models/square";
import {NetworkRoom} from "../engine/network/network.room";
import {NetworkResponse} from "../engine/network/network.response";

export class JoinGameStep extends GameStep {
  name: string = "joingame";

  private background: HTMLImageElement;
  private serverCheckTimer = { current: 0, max: 10000 };
  private serverList: NetworkRoom[] = [];
  private loading: Label|null = null;
  private gameListLabel: Label[] = [];

  constructor(board: Board) {
    super(board);
    this.background = new Image();
    this.background.src = "./assets/images/creategame/background.jpg";
  }

  onEnter(): void {
    let self = this;

    /** Background */
    let background = new class extends Entity {
      draw(ctx: CanvasRenderingContext2D): void { this.board?.ctx.drawImage(self.background, 0, 0, this.board.config.board.size.width, this.board.config.board.size.height); }
      update(): void {}
    }(0, 0, this.board.config.board.size.width, this.board.config.board.size.height);
    this.board.addEntity(background);

    /** Black overlay */
    let overlay = new Square(0, 0, this.board.width, this.board.height, "rgba(0,0,0,0.5)", "rgba(0,0,0,0.5)");
    this.board.addEntity(overlay);

    /** Title */
    var title = new Label(0, 0, "Parties disponibles", this.board.ctx);
    title.fontSize = 40;
    title.x = this.board.width / 2 - title.width / 2;
    this.board.addEntity(title);

    /** Loading label */
    this.loading = new Label(0, 0, "Rechargement des parties...", this.board.ctx);
    this.loading.fontSize = 12;
    this.loading.x = this.board.width - this.loading.width;
    this.loading.visible = false;
    this.board.addEntity(this.loading);

    /** Load game list */
    this.updateGameList();
  }

  update(delta: number) {
    this.serverCheckTimer.current += delta;
    if (this.serverCheckTimer.current >= this.serverCheckTimer.max) {
      this.serverCheckTimer.current = 0;
      this.updateGameList();
    }

    super.update(delta);
  }

  updateGameList() {
    console.log("Updating game list...");
    if (this.loading) this.loading.visible = true;
    this.board.removeEntities(this.gameListLabel);
    this.board.networkManager.getOpenedRooms().subscribe((response) => {
      if (response.status === "success") {
        if (this.loading) this.loading.visible = false;
        this.serverList = response.servers;
        let listPosition = {x: this.board.width / 4, y: 100};
        for (let i = 0; i < this.serverList.length; i++) {
          let room = this.serverList[i];
          console.log(room);
          let line = new Label(0, 0, `[${room.players.length}/${room.limit}] ${room.game} - ${room.name}`, this.board.ctx);
          line.translate = listPosition;
          line.y = (i+1)*40;
          line.hoverFontColor = "rgba(200, 200, 200, 1)";
          line.hoverCursor = "pointer";
          line.onMouseEvent("click", (e) => {
            console.log(room.uid + " clicked");
            this.board.networkManager.joinRoom(room.uid).then((response: NetworkResponse) => {
              if (response.status === "success") {
                this.board.moveToStep("waitingroom", response.data);
              }else {
                if (response.code === "room_full") {
                  alert("Il n'y a plus de place dans cette partie.");
                  this.updateGameList();
                }
              }
            });
          })
          this.gameListLabel.push(line);
          this.board.addEntity(line);
        }
      }
    });
  }

  onLeave(): void {

  }
}
