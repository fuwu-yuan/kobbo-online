import {Component, OnInit} from '@angular/core';
import {MainStep} from "../../steps/main";
import {WaitingRoomStep} from "../../steps/waitingRoom";
import {JoinGameStep} from "../../steps/joinGame";
import {InGameStep} from "../../steps/ingame";
import {Board} from '@fuwu-yuan/bgew';
import {environment} from "../../../environments/environment";
import {JulienGameServer} from "../../override/JulienGameServer";
import {Kobbo} from "../../game/Kobbo";
import {Player} from "../../models/player";

@Component({
  selector: 'app-ingame',
  templateUrl: './ingame.component.html',
  styleUrls: ['./ingame.component.sass']
})
export class IngameComponent implements OnInit {

  private board;

  constructor() {
    this.board = new Board("Kobbo - Meilleur jeu de cartes", "0.0.1", 900, 900);
    //this.board.networkManager = new JulienGameServer(this.board);
    this.board.networkManager.apiUrl = environment.apiUrl;
    this.board.networkManager.wsUrl = environment.wsUrl;
  }

  ngOnInit(): void {
    /* Init and start board */
    this.initSteps();
    this.board.start();

    /* Test */
    for (let i = 0; i < 4; i++) {
      let player = new Player(i, "uid"+i, "Player"+i);
      if (i === 0) {
        player.isHost = true;
      }
      player.ready = true;
      Kobbo.players.push(player);
    }
    this.board.moveToStep("ingame");
  }

  initSteps() {
    /* Init steps */
    if (this.board) {
      let mainStep = new MainStep(this.board);
      this.board.step = mainStep; // First shown step
      /* All Steps */
      this.board.addSteps([
        mainStep,
        new WaitingRoomStep(this.board),
        new JoinGameStep(this.board),
        new InGameStep(this.board)
      ]);
    }
  }
}
