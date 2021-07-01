import {Entities, GameStep} from "@fuwu-yuan/bgew";
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';

export class MainStep extends GameStep {
  name: string = "main";

  onEnter(): void {
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
    // Normal
    createButton.strokeColor = "rgba(230,77,59, 1.0)";
    createButton.fontColor = "rgba(230,77,59, 1.0)";
    // Hover
    createButton.hoverFillColor = "rgba(230,77,59, 1.0)";
    createButton.hoverFontColor = "white";
    createButton.hoverCursor = "pointer";
    // Clicked
    createButton.clickStrokeColor = "rgba(230,37,39, 1.0)";
    createButton.clickFillColor = "rgba(230,37,39, 1.0)";
    createButton.clickFontColor = "white";
    createButton.onMouseEvent("click", (event: MouseEvent) => {
      console.log("Creating game !");
      let defaultName: string = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals],
        separator: ' ',
        length: 3,
      });
      defaultName = defaultName[0].toUpperCase() + defaultName.slice(1);
      let name = prompt("Nom de la partie", defaultName);
      if (name !== null) {
        this.board.networkManager.createRoom(name, 4, true)
          .then((res) => {
            console.log("Connecté et prêt !");
            this.board.moveToStep("waitingroom", Object.assign({}, res.data, { isHost: true }));
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
    // Normal
    joinButton.strokeColor = "rgba(230,77,59, 1.0)";
    joinButton.fontColor = "rgba(230,77,59, 1.0)";
    // Hover
    joinButton.hoverFillColor = "rgba(230,77,59, 1.0)";
    joinButton.hoverFontColor = "white";
    joinButton.hoverCursor = "pointer";
    // Clicked
    joinButton.clickStrokeColor = "rgba(230,37,39, 1.0)";
    joinButton.clickFillColor = "rgba(230,37,39, 1.0)";
    joinButton.clickFontColor = "white";
    joinButton.onMouseEvent("click", (event: MouseEvent) => {
      console.log("Joining Game !");
      this.board.moveToStep("joingame");
    });

    this.board.addEntity(createButton);
    this.board.addEntity(joinButton);
  }

  onLeave(): void {

  }
}
