import {Component, OnInit} from '@angular/core';
import {MainStep} from "../../steps/main";
import {WaitingRoomStep} from "../../steps/waitingRoom";
import {JoinGameStep} from "../../steps/joinGame";
import {InGameStep} from "../../steps/ingame";
import {Board, Network} from '@fuwu-yuan/bgew';
import {environment} from "../../../environments/environment";

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
    if(!environment.production) {
      console.log("APP IS IN DEV MODE");
      board.networkManager = new class extends Network.NetworkManager {
        get apiUrl(): string { return "http://127.0.0.1:8081/api"; }
        get wsUrl(): string { return "ws://127.0.0.1:8081/"; }
      }(board);
    }
    //this.board.networkManager = new JulienGameServer(this.board);

    /* Init and start board */
    this.initSteps(board);
    board.start();
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
