import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ContentChild,
  HostListener,
  OnInit,
  TemplateRef
} from '@angular/core';
import {MainStep} from "../../steps/main";
import {WaitingRoomStep} from "../../steps/waitingRoom";
import {JoinGameStep} from "../../steps/joinGame";
import {InGameStep} from "../../steps/ingame";
import {Board, Network} from '@fuwu-yuan/bgew';
import {environment} from "../../../environments/environment";
import {Kobbo} from "../../game/Kobbo";
import {version} from '../../../../package.json';
import {ActivatedRoute} from '@angular/router';
import {animals, colors, uniqueNamesGenerator} from "unique-names-generator";
import {DomSanitizer} from "@angular/platform-browser";
import {MessagesService} from "../../services/messages.service";
import {CookieService} from "ngx-cookie";
import {KobboConfig} from "../../game/kobboConfig";
import {NgbModal, NgbModalConfig, NgbModalRef} from "@ng-bootstrap/ng-bootstrap";

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

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private cookieService: CookieService,
    private modalService: NgbModal,
  ) {
    KobboConfig.cookieService = cookieService;
    var ua = navigator.userAgent;

    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)) {
      this.isDesktop = false;
    }
    console.log(this.isDesktop ? "Desktop" : "Mobile");
    Kobbo.GAME_VERSION = version;
  }

  @HostListener("window:beforeunload", ["$event"])
  unloadHandler(event: Event) {
    if (this.board && this.board.step.name === "ingame") {
      event.returnValue = false; // stay on same page
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenSize.width = window.innerWidth;
    this.screenSize.height = window.innerHeight;

    let wh = Math.min(this.screenSize.width, this.screenSize.height);

    this.scale = Math.round(wh / this.boardDefaultSize * 100)/100;
    if (this.board) {
      this.board.scale = this.scale;
      if (this.isDesktop) {
        MessagesService.getInstance().scale(this.board.scale);
      }
    }
  }

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    this.onResize(null);
  }

  ngAfterViewInit(): void {
    //if (this.isDesktop) {
      let gameElem = document.getElementById("game");
      console.log(gameElem);
      this.board = new Board(Kobbo.GAME_NAME, Kobbo.GAME_VERSION, this.boardDefaultSize, this.boardDefaultSize, gameElem);
      this.board.scale = this.scale;
      if (this.isDesktop) {
        MessagesService.getInstance().scale(this.board.scale);
      }
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

      /* Check short game access */
      this.checkShortGameAccess();
    //}
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

  private checkShortGameAccess() {
    this.route.queryParams
      .subscribe(params => {
          if (Object.keys(params).indexOf("game") > -1) {
            let defaultNickname = uniqueNamesGenerator({
              dictionaries: [colors, animals],
              separator: '',
              length: 2,
              style: "capital"
            });
            let nickname = prompt("Choisissez un pseudo", defaultNickname);
            if (nickname !== null) {
              this.board?.networkManager.joinRoom(params["game"]).then((response: Network.Response) => {
                if (response.status === "success") {
                  this.board?.moveToStep("waitingroom", Object.assign({}, response.data, { isHost: false, nickname: nickname }));
                }else {
                  if (response.code === "room_full") {
                    alert("Il n'y a plus de place dans cette partie.");
                  }
                }
              });
            }
          }
        }
      );
  }

  get stylish() {
    return this.sanitizer.bypassSecurityTrustStyle(`
      zoom: ${this.scale};
      -ms-zoom: ${this.scale};
      -webkit-zoom: ${this.scale};
      -moz-transform:  scale(${this.scale},${this.scale});
      -moz-transform-Origin: left top;
    `);
  }

  openModal(modal: any) {
    this.modalService.open(modal, {
      backdropClass: 'light-blue-backdrop',
      size: 'xl',
      centered: true,
      windowClass: "big-modal"
    });
  }

  closeChat() {
    let chat = document.getElementById("chat");
    if (chat) {
      chat.style.display = "none";
    }
  }

  openChat() {
    let chat = document.getElementById("chat");
    if (chat) {
      chat.style.display = "block";
    }
  }

  canShowChat() {
    let res = false;
    let chat = document.getElementById("chat");
    if (chat) {
      res = chat.classList.contains("show");
    }
    return res;
  }
}
