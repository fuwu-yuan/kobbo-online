import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {StockService} from "../../services/stock.service";
import {Board} from "../../engine/board";
import {MainStep} from "../../steps/main";
import {Config} from "../../engine/config";
import {CreateGameStep} from "../../steps/createGame";
import {JoinGameStep} from "../../steps/joinGame";
import {InGameStep} from "../../steps/ingame";

@Component({
  selector: 'app-ingame',
  templateUrl: './ingame.component.html',
  styleUrls: ['./ingame.component.sass']
})
export class IngameComponent implements OnInit {

  @ViewChild('canvas', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;

  board: Board|null = null;

  private config: Config;

  constructor(
    private stockService: StockService,
  ) {
    this.config = new Config();
  }

  ngOnInit(): void {
    /* Init and start board */
    this.board = new Board(this.canvas, this.config);
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
        new InGameStep(this.board as Board, this.stockService)
      ]);
    }
  }
}
