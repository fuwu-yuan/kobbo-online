import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Board} from "../../engine/board";
import {MainStep} from "../../steps/main";
import {CreateGameStep} from "../../steps/createGame";
import {JoinGameStep} from "../../steps/joinGame";
import {InGameStep} from "../../steps/ingame";
import {NetworkManager} from "../../engine/network/network.manager";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-ingame',
  templateUrl: './ingame.component.html',
  styleUrls: ['./ingame.component.sass']
})
export class IngameComponent implements OnInit {

  constructor(
    private board: Board
  ) {
  }

  ngOnInit(): void {
    /* Init and start board */
    this.board.name = "Kobbo";
    this.board.version = "0.0.1";
    this.initSteps();
    this.board.start();
  }

  initSteps() {
    /* Init steps */
    if (this.board) {
      let mainStep = new MainStep(this.board as Board);
      this.board.step = mainStep; // First shown step
      /* All Steps */
      this.board?.addSteps([
        mainStep,
        new CreateGameStep(this.board as Board),
        new JoinGameStep(this.board as Board),
        new InGameStep(this.board as Board)
      ]);
    }
  }
}
