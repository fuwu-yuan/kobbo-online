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
  styleUrls: ['./ingame.component.scss']
})
export class IngameComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
    let board = new Board("Kobbo - Meilleur jeu de cartes", "0.0.1", 900, 900);
    //this.board.networkManager = new JulienGameServer(this.board);
    board.networkManager.apiUrl = environment.apiUrl;
    board.networkManager.wsUrl = environment.wsUrl;
    /* Init and start board */
    this.initSteps(board);
    board.start();

    /* Test */
    for (let i = 0; i < 4; i++) {
      let player = new Player(i, "uid"+i, "Player"+i);
      if (i === 0) {
        player.isHost = true;
      }
      player.ready = true;
      Kobbo.players.push(player);
    }
    Kobbo.player = Kobbo.players[0];
    board.moveToStep("ingame");
  }

  initSteps(board: Board) {
    /* Init steps */
    if (board) {
      let mainStep = new MainStep(board);
      board.step = mainStep; // First shown step
      /* All Steps */
      board.addSteps([
        mainStep,
        new WaitingRoomStep(board),
        new JoinGameStep(board),
        new InGameStep(board)
      ]);
    }
  }
}
