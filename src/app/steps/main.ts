import {Entities, GameStep} from "@fuwu-yuan/bgew";
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';

export class MainStep extends GameStep {
  name: string = "main";

  onEnter(): void {
    let self = this;
    let buttonsWidth = 200;
    let buttonHeight = 60;

    /** Create button */
    let createButton = new Entities.Button(
      this.board.config.board.size.width / 4 - buttonsWidth / 2,
      this.board.config.board.size.height / 2 - buttonHeight / 2,
      buttonsWidth,
      buttonHeight,
      "Créer une partie"
    );
    createButton.hoverCursor = "pointer";
    createButton.onMouseEvent("click", function(event: MouseEvent) {
      console.log("Creating game !");
      let defaultName: string = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: ' ',
        length: 3,
      });
      defaultName = defaultName[0].toUpperCase() + defaultName.slice(1);
      let name = prompt("Nom de la partie", defaultName);
      if (name !== null) {
        self.board.networkManager.createRoom(name, 4, true)
          .then((res) => {
            console.log("Connecté et prêt !");
            self.board.moveToStep("waitingroom", Object.assign({}, res.data, { isHost: true }));
          })
          .catch((err) => {
            console.error("Error: ", err);
          });
      }
    });

    /** Join button */
    let joinButton = new Entities.Button(
      this.board.config.board.size.width / 4 * 3 - buttonsWidth / 2,
      this.board.config.board.size.height / 2 - buttonHeight / 2,
      buttonsWidth,
      buttonHeight,
      "Rejoindre une partie"
    );
    joinButton.hoverCursor = "pointer";
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
