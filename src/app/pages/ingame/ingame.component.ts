import {Component, OnInit} from '@angular/core';
import {MainStep} from "../../steps/main";
import {WaitingRoomStep} from "../../steps/waitingRoom";
import {JoinGameStep} from "../../steps/joinGame";
import {InGameStep} from "../../steps/ingame";
import {Board, Network} from '@fuwu-yuan/bgew';
import {environment} from "../../../environments/environment";
import {Kobbo} from "../../game/Kobbo";
import { faFacebook, faTwitter, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { faMailBulk } from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-ingame',
  templateUrl: './ingame.component.html',
  styleUrls: ['./ingame.component.scss']
})
export class IngameComponent implements OnInit {

  isDesktop: boolean = true;
  currentYear: number = new Date().getFullYear();
  faFacebook = faFacebook;
  faTwitter = faTwitter;
  faLinkedin = faLinkedin;
  faMailBulk = faMailBulk;

  constructor() {
    var ua = navigator.userAgent;

    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)) {
      this.isDesktop = false;
    }
  }

  ngOnInit(): void {
    if (this.isDesktop) {
      let board = new Board(Kobbo.GAME_NAME, Kobbo.GAME_VERSION, 900, 900);
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

  getNameAndVersion() {
    return `${Kobbo.GAME_NAME} v${Kobbo.GAME_VERSION}`;
  }
}
