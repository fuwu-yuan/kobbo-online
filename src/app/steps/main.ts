import {Entities, GameStep} from "@fuwu-yuan/bgew";

export class MainStep extends GameStep {
  name: string = "main";

  onEnter(): void {
    let self = this;
    let buttonsWidth = 200;
    let buttonHeight = 60;
    let createButton = new Entities.Button(
      this.board.config.board.size.width / 4 - buttonsWidth / 2,
      this.board.config.board.size.height / 2 - buttonHeight / 2,
      buttonsWidth,
      buttonHeight,
      "Créer une partie"
    );
    let joinButton = new Entities.Button(
      this.board.config.board.size.width / 4 * 3 - buttonsWidth / 2,
      this.board.config.board.size.height / 2 - buttonHeight / 2,
      buttonsWidth,
      buttonHeight,
      "Rejoindre une partie"
    );
    createButton.onMouseEvent("click", function(event: MouseEvent) {
      console.log("Creating game !");
      let name = prompt("Nom de la partie");
      if (name !== null) {
        self.board.networkManager.createRoom(name, 4)
          .then((res) => {
            console.log("Connecté et prêt !");
            self.board.moveToStep("waitingroom", res.data);
          })
          .catch((err) => {
            console.error("Error: ", err);
          });
      }
    });
    joinButton.onMouseEvent("click", function(event: MouseEvent) {
      console.log("Joining Game !");
      self.board.moveToStep("joingame");
    });

    this.board.addEntity(createButton);
    this.board.addEntity(joinButton);
  }

  onLeave(): void {

  }
}
