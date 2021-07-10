import {AfterContentInit, AfterViewInit, Component, HostListener, OnInit} from '@angular/core';
import {MainStep} from "../../steps/main";
import {WaitingRoomStep} from "../../steps/waitingRoom";
import {JoinGameStep} from "../../steps/joinGame";
import {InGameStep} from "../../steps/ingame";
import {Board, Network} from '@fuwu-yuan/bgew';
import {environment} from "../../../environments/environment";
import {Kobbo} from "../../game/Kobbo";
import { version } from '../../../../package.json';

@Component({
  selector: 'app-ingame',
  templateUrl: './ingame.component.html',
  styleUrls: ['./ingame.component.scss']
})
export class IngameComponent implements OnInit,AfterViewInit,AfterContentInit {

  isDesktop: boolean = true;
  screenSize: {width: number, height: number} = {height: 0, width: 0};
  boardDefaultSize: number = 900;
  board: Board|null = null;
  scale: number = 1;

  constructor() {
    var ua = navigator.userAgent;

    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)) {
      this.isDesktop = false;
    }
    console.log(this.isDesktop ? "Desktop" : "Mobile");
    Kobbo.GAME_VERSION = version;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize.width = window.innerWidth;
    this.screenSize.height = window.innerHeight;

    let wh = Math.min(this.screenSize.width, this.screenSize.height);

    this.scale = wh / this.boardDefaultSize;
    console.log("ScreenSize: ", this.screenSize);
    console.log("Scaling screen to " + this.scale);
    if (this.board) {
      this.board.scale = this.scale;
    }
  }

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    this.onResize(null);
  }

  ngAfterViewInit(): void {
    if (this.isDesktop) {
      let gameElem = document.getElementById("game");
      console.log(gameElem);
      this.board = new Board(Kobbo.GAME_NAME, Kobbo.GAME_VERSION, this.boardDefaultSize, this.boardDefaultSize, gameElem);
      this.board.scale = this.scale;
      if(!environment.production) {
        console.log("APP IS IN DEV MODE");
        this.board.networkManager = new class extends Network.NetworkManager {
          get apiUrl(): string { return "http://127.0.0.1:8081/api"; }
          get wsUrl(): string { return "ws://127.0.0.1:8081/"; }
        }(this.board);
      }
      //this.board.networkManager = new JulienGameServer(this.board);

      /* Init and start board */
      this.initSteps(this.board);
      this.board.start();
    }
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
