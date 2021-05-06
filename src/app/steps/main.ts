import {GameStep} from "../engine/gamestep";
import {Button} from "../models/button";

export class MainStep extends GameStep {
  name: string = "main";

  onEnter(): void {
    let self = this;
    let buttonsWidth = 200;
    let buttonHeight = 60;
    let createButton = new Button(
      this.board.config.board.size.width / 4 - buttonsWidth / 2,
      this.board.config.board.size.height / 2 - buttonHeight / 2,
      buttonsWidth,
      buttonHeight,
      "Créer une partie"
    );
    let joinButton = new Button(
      this.board.config.board.size.width / 4 * 3 - buttonsWidth / 2,
      this.board.config.board.size.height / 2 - buttonHeight / 2,
      buttonsWidth,
      buttonHeight,
      "Rejoindre une partie"
    );
    createButton.onMouseEvent("click", function(event: MouseEvent) {
      console.log("Creating game !");
      self.board.moveToStep("ingame");
    });
    joinButton.onMouseEvent("click", function(event: MouseEvent) {
      console.log("Joining Game !");
      self.board.moveToStep("join_game");
    });

    this.board.addEntity(createButton);
    this.board.addEntity(joinButton);
  }

  onLeave(): void {

  }
}
