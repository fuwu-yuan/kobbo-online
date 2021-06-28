import {Card, Colors, Names, Powers, PowersHelp} from "../models/card";
import {Stock} from "../models/stock";
import {Board, Entities, GameStep} from "@fuwu-yuan/bgew";
import {Kobbo} from "../game/Kobbo";
import {create as randomseed, RandomSeed} from 'random-seed';
import {Waste} from "../models/waste";
import {MessagesService} from "../services/messages.service";
import {DebugService} from "../services/debug.service";
import {Player} from "../models/player";
import {KobboConfig} from "../game/kobboConfig";

const DEBUG: boolean = false;
const GAME_WILL_START_DURATION: number = 5; // seconds
const WATCH_CARD_DURATION: number = 5; // seconds
const END_GAME_REVEAL_TIME: number = 5; // seconds
const DEAL_SPEED: number = 0.5; // seconds

export class InGameStep extends GameStep {
  name: string = "ingame";

  private stock: Stock;
  private waste: Waste;
  private gametable: Entities.Container;
  private centerSpace: Entities.Container;
  private stockRandomSeed: RandomSeed;
  private random: RandomSeed;
  private FPSLabel: Entities.Label;
  private FPSUpdate: any = {limit: 1000, count: 0};
  private gameState: any;
  private drawnCard: Card|null = null;
  private switchingCard: Card|null = null;
  private messagesService;
  private debugService;

  constructor(board: Board) {
    super(board);
    this.stock = new Stock();
    this.waste = new Waste();
    this.stockRandomSeed = randomseed(this.stock.seed);
    this.random = randomseed();
    this.gametable = new Entities.Container(0, 0, board.width, board.height);
    this.centerSpace = new Entities.Container(0, 0, 0, 0);
    this.FPSLabel = new Entities.Label(this.board.width - 100, 10, "FPS: -", this.board.ctx);
    this.FPSLabel.fontColor = "black";
    this.board.debug.skeleton = DEBUG;
    this.messagesService = MessagesService.getInstance();
    this.debugService = DebugService.getInstance();
    if (DEBUG) {
      this.debugService.show();
    }
  }

  async onEnter(data: any) {
    console.log("Entering InGame");
    console.log(Kobbo.players);
    this.initGame();
    this.initBoard();
    this.initEvents();
    this.board.addEntity(this.FPSLabel);
    await this.deal();
    await this.gameWillStart();
    this.createKobboButton();
    this.changgeGameState(GameState.CURRENT_PLAYER_DRAW)
    //this.test();
  }

  changgeGameState(state: string) {
    this.gameState = state;
  }

  test(): void {
    // Carré seul
    let squareOnly = new Entities.Square(100, 100, 200, 200, "blue", "blue", "green", "green");
    this.board.addEntity(squareOnly);
    let squareContainer = new Entities.Container(0, 0, 200, 200);
    squareContainer.translate = {x: 300, y: 300};
    squareContainer.rotate = 90;
    let innerContainer = new Entities.Container(0, 0, 100, 100);
    innerContainer.translate = {x: 10, y: 10};
    innerContainer.rotate = 90;
    let innerSquare = new Entities.Square(0, 0, 60, 60, "blue", "blue", "green", "green");
    innerSquare.translate = {x: 5, y: 5};
    innerSquare.rotate = 90;
    squareContainer.addEntity(innerContainer);
    innerContainer.addEntity(innerSquare);
    this.board.addEntity(squareContainer);
    squareContainer.onMouseEvent("mouseenter", function() {
      console.log("Entering container");
    });
    squareContainer.onMouseEvent("mouseleave", function() {
      console.log("Leaving container");
    });

    let spaceSize = {
      width: this.board.width/3,
      height: this.board.height/3
    };
    let pos = { x: spaceSize.width, y: spaceSize.height*2, deg: 0 };
    let parent = new Entities.Container(pos.x, pos.y, spaceSize.width, spaceSize.height);
    parent.translate = { x: spaceSize.width, y: 0 };
    parent.rotate = 180;
    let card = new Card(Names.$KING, Colors.DIAMONDS);
    card.x = 0;
    card.y = 0;
    parent.addEntity(card);
    card.onMouseEvent("click", function() {
      card.showCard(!card.cardVisible);
    });
    this.board.addEntity(parent);
  }

  createKobboButton() {
    let player = Kobbo.player;
    if (player.space) {
      let buttonSize = { width: 80, height: 25 };
      let kobbo = new Entities.Button(
        player.space.width / 2 - buttonSize.width / 2,
        player.space.height / 2 - buttonSize.height / 2,
        buttonSize.width,
        buttonSize.height,
        "KOBBO"
      );
      kobbo.fontSize = 16;
      // Normal
      kobbo.strokeColor = "rgba(230,77,59, 1.0)";
      kobbo.fontColor = "rgba(230,77,59, 1.0)";
      // Hover
      kobbo.hoverFillColor = "rgba(230,77,59, 1.0)";
      kobbo.hoverFontColor = "white";
      kobbo.hoverCursor = "pointer";
      // Clicked
      kobbo.clickStrokeColor = "rgba(230,37,39, 1.0)";
      kobbo.clickFillColor = "rgba(230,37,39, 1.0)";
      kobbo.clickFontColor = "white";

      kobbo.onMouseEvent("click", () => {
        if (kobbo.text.indexOf("KOBBO") > -1) {
          kobbo.text = "SÛR ?!";
        }else {
          this.messagesService.add(Kobbo.player.name, "Kobbo !!!", true);
          player.space?.removeEntity(kobbo);
          this.endOfGame(Kobbo.player);
        }
      });

      player.space.addEntity(kobbo);
    }
  }

  endOfGame(player: Player) {
    if (player.space) {
      this.changgeGameState(GameState.GAME_END);
      let uid = this.messagesService.add("Kobbo", "Le jeu de " + player.name + " sera révélé dans "+END_GAME_REVEAL_TIME+" secondes", true);
      let i = 0;

      let failLabel = new Entities.Label(0, 0, "PERDU", this.board.ctx);
      failLabel.fontColor = "red";

      let successLabel = new Entities.Label(0, 0, "GAGNÉ", this.board.ctx);
      successLabel.fontColor = "green";

      failLabel.fontSize = successLabel.fontSize = 60;
      failLabel.x = successLabel.x = player.space.width / 2 - failLabel.width / 2;
      failLabel.y = successLabel.y = player.space.height / 2 - failLabel.height / 2;

      let timer = setInterval(() => {
        i++;
        this.messagesService.edit(uid, "Kobbo", "Le jeu de " + player.name + " sera révélé dans "+ (END_GAME_REVEAL_TIME-i)  +" seconde" + ((END_GAME_REVEAL_TIME-i) > 1 ? "s" : ""));
        if (i === END_GAME_REVEAL_TIME) {
          clearInterval(timer);
          let total = 0;
          for (const card of player.cards) {
            card?.showCard(true);
            total += card?.value;
          }
          if (total <= KobboConfig.GAME_RULES.MIN_VALUE_TO_WIN) {
            player.space?.addEntity(successLabel);
            this.messagesService.add("Kobbo", player.name + " à gagné ! Total des points : " + total, true);
          }else {
            player.space?.addEntity(failLabel);
            this.messagesService.add("Kobbo", player.name + " à perdu ! Total des points : " + total + ". Il devait faire " + KobboConfig.GAME_RULES.MIN_VALUE_TO_WIN + " ou moins.", true);
          }
        }
      }, 1000);
    }
  }

  gameWillStart(): Promise<void> {
    let msgUid = this.messagesService.add("Kobbo", "La partie va commencer, vous avez " + GAME_WILL_START_DURATION + " secondes pour regarder vos 2 cartes du bas", true);
    let i = 0;
    return new Promise((resolve) => {
      this.changgeGameState(GameState.GAME_WILL_START);
      let counter = setInterval(() => {
        i++;
        this.messagesService.edit(msgUid, null, "La partie va commencer, vous avez " + (GAME_WILL_START_DURATION-i) + " seconde"+((GAME_WILL_START_DURATION-i) > 1 ? "s" : "")+" pour regarder vos 2 cartes du bas");
        if (i === GAME_WILL_START_DURATION) {
          clearInterval(counter);
          this.changgeGameState(GameState.OTHER_PLAYER_PLAYING);
          for (const card of Kobbo.player.cards) {
            card?.showCard(false);
          }
          resolve();
        }
      }, 1000);
    });
  }

  onLeave(): void {

  }

  initGame(): void {
    this.stock.initStock();
  }

  initEvents() {
    // WASTE CLICKED
    this.waste.space?.onMouseEvent("click", () => {
      if (this.gameState === GameState.CURRENT_PLAYER_DRAWN) {
        if (this.drawnCard !== null) {
          this.gametable.removeEntity(this.drawnCard);
          this.sendToWaste(this.drawnCard);
          if (this.drawnCard.power !== null) {
            this.changgeGameState(GameState.USE_POWER);
            // @ts-ignore
            this.messagesService.add("Kobbo", "Vous pouvez utiliser le pouvoir: " + PowersHelp[this.drawnCard.power], true);
          }else {
            this.changgeGameState(GameState.OTHER_PLAYER_PLAYING);
          }
        }
      }else if (this.gameState === GameState.USE_POWER) {
        this.changgeGameState(GameState.OTHER_PLAYER_PLAYING);
        this.messagesService.add("Kobbo", "Vous n'utilisez pas le pouvoir.", true);
      }
    });

    // ANY CARD CLICKED
    for (const card of this.stock) {
      card.onMouseEvent("click", (event: MouseEvent) => {

        // DEBUG
        this.debugService.set("Last clicked card", card.__toString(), "lastclickedcard");

        // CLICK ON OWNED CARD
        if (card.owner === Kobbo.player) {

          // GAME WILL START STATUS
          if (this.gameState === GameState.GAME_WILL_START) {
            // Card clicked is first or second card
            if (card === Kobbo.player.cards[0] || card === Kobbo.player.cards[1]) {
              card.showCard(!card.cardVisible);
            }

            // CARD DRAWN STATUS
          } else if (this.gameState === GameState.CURRENT_PLAYER_DRAWN) {
            if (this.drawnCard) {
              let i = Kobbo.player.removeCard(card);
              this.sendToWaste(card);
              Kobbo.player.giveCard(this.drawnCard, i);
              this.gametable.removeEntity(this.drawnCard);
              this.drawnCard.showCard(true);
              setTimeout(() => {
                this.drawnCard?.showCard(false)
              }, 2000);
              this.changgeGameState(GameState.OTHER_PLAYER_PLAYING);
            }

            // USE POWER
          } else if (this.gameState === GameState.USE_POWER) {

            // POWER : WATCH SELF
            if (this.drawnCard?.power === Powers.WATCH_SELF) {
              card.showCard(true);
              this.changgeGameState(GameState.WAIT);
              setTimeout(() => {
                card.showCard(false);
                this.changgeGameState(GameState.OTHER_PLAYER_PLAYING);
              }, WATCH_CARD_DURATION * 1000);

              // POWER : BLIND SWITCH
            }else if (this.drawnCard?.power === Powers.BLIND_SWITCH) {
              card.setBackGreen();
              this.switchingCard = card;

              // POWER : KING SWITCH
            }else if (this.drawnCard?.power === Powers.KING_SWITCH) {

              // SWITCHING
              if (this.switchingCard !== null) {
                this.changgeGameState(GameState.WAIT);
                card.setBackGreen();
                setTimeout(() => {
                  let self = card.owner;
                  let other = this.switchingCard?.owner;
                  if (other && self && this.switchingCard) {
                    let i = self.removeCard(card);
                    self.giveCard(this.switchingCard, i);
                    i = other.removeCard(this.switchingCard);
                    other.giveCard(card, i);
                    card.setBackGreen();
                    this.switchingCard.showCard(true);
                  }
                  setTimeout(() => {
                    if (this.switchingCard) {
                      this.switchingCard.showCard(false);
                    }
                    card.resetBack();
                    this.switchingCard = null;
                    this.changgeGameState(GameState.OTHER_PLAYER_PLAYING);
                  }, 1000);
                }, 1000);

                // NOT SWITCHING
              }else {
                this.messagesService.add("Kobbo", "Vous devez d'abbord sélectionner la carte d'un adversaire", true);
              }
            }
          }

          // CLICK OTHER PLAYER CARD
        }else if (card.owner !== null && card.owner !== Kobbo.player) {

          // USE POWER
          if (this.gameState === GameState.USE_POWER) {

            // POWER : WATCH OTHER
            if (this.drawnCard?.power === Powers.WATCH_OTHER) {
              this.changgeGameState(GameState.WAIT);
              card.showCard(true);
              setTimeout(() => {
                card.showCard(false);
                this.changgeGameState(GameState.OTHER_PLAYER_PLAYING);
              }, WATCH_CARD_DURATION * 1000);

              // POWER : BLIND SWITCH
            } else if (this.drawnCard?.power === Powers.BLIND_SWITCH) {
              if (this.switchingCard !== null) {
                this.changgeGameState(GameState.WAIT);
                card.setBackRed();
                setTimeout(() => {
                  let other = card.owner;
                  if (other && this.switchingCard) {
                    let i = other.removeCard(card);
                    other.giveCard(this.switchingCard, i);
                    i = Kobbo.player.removeCard(this.switchingCard);
                    Kobbo.player.giveCard(card, i);
                    card.setBackRed();
                    this.switchingCard.setBackGreen();
                  }
                  setTimeout(() => {
                    if (this.switchingCard) {
                      this.switchingCard.resetBack();
                    }
                    card.resetBack();
                    this.switchingCard = null;
                    this.changgeGameState(GameState.OTHER_PLAYER_PLAYING);
                  }, 1000);
                }, 1000);
              }else {
                this.messagesService.add("Kobbo", "Vous devez d'abbord sélectionner une de vos cartes");
              }
            }

            // POWER : KING SWITCH
            else if (this.drawnCard?.power === Powers.KING_SWITCH) {

              // CHOOSE WITCH CARD TO SHOW
              if (this.switchingCard === null) {
                card.showCard(true);
                this.switchingCard = card;
                this.messagesService.add("Kobbo", "Si vous voulez échanger la carte, cliquez sur l'une des votre, sinon retournez-la à nouveau pour la laisser au joueur", true);
              }
              // WILL NOT SWITCH
              else {
                card.showCard(false);
                this.messagesService.add("Kobbo", "Vous n'avez pas échangé la carte", true);
                this.changgeGameState(GameState.OTHER_PLAYER_PLAYING);
              }
            }
          }

          // CLICK ON FIRST CARD ON STOCK
        }else if (card === this.stock.topCard()) {
          if (this.gameState === GameState.CURRENT_PLAYER_DRAW) {
            this.drawCard();
            this.changgeGameState(GameState.CURRENT_PLAYER_DRAWN);
          }
        }
      });
    }
  }

  initBoard(): void {
    let spaceSize = {
      width: this.board.width/3,
      height: this.board.height/3
    };
    let spacePos = [
      { x: spaceSize.width, y: spaceSize.height*2, deg: 0 },
      { x: 0, y: spaceSize.height, deg: 90},
      { x: spaceSize.width, y: 0, deg: 180 },
      { x: spaceSize.width*2, y: spaceSize.height, deg: 270 }
    ];

    /* Add players */
    for (const player of Kobbo.players) {
      let playerSpace = new Entities.Container(spacePos[player.index].x, spacePos[player.index].y, spaceSize.width, spaceSize.height);
      let background = new Entities.Square(0, 0, spaceSize.width, spaceSize.height, DEBUG ? ["red", "blue", "green", "black"][player.index] : "lightgray", "transparent");
      playerSpace.rotate = spacePos[player.index].deg;
      playerSpace.addEntity(background);
      player.space = playerSpace;
      this.gametable.addEntity(playerSpace);
    }

    /* Init center space */
    this.centerSpace.width = spaceSize.width;
    this.centerSpace.height = spaceSize.height;
    this.centerSpace.x = spaceSize.width;
    this.centerSpace.y = spaceSize.height;
    let stockSpace = new Entities.Container(0, 0, this.centerSpace.width/2, this.centerSpace.height);
    let wasteSpace = new Entities.Container(this.centerSpace.width/2, 0, this.centerSpace.width/2, this.centerSpace.height);
    this.centerSpace.addEntities([stockSpace, wasteSpace]);
    this.gametable.addEntity(this.centerSpace);

    this.stock.space = stockSpace;
    this.waste.space = wasteSpace;
    for (const card of this.stock.slice().reverse()) {
      card.x = this.stock.space.width / 2 - card.width/2;
      card.y = this.stock.space.height / 2 - card.height / 2;
      card.rotate = this.stockRandomSeed.intBetween(-5, 5);
      this.stock.space.addEntity(card);
    }

    /* Set table orientation */
    this.gametable.rotate = (Kobbo.player.index) * -90;
    this.board.addEntity(this.gametable);
  }

  deal(): Promise<void> {
    this.messagesService.add("Kobbo", "Distribution des cartes", true);
    return new Promise((resolve) => {
      this.changgeGameState(GameState.DEALING);
      let playerIndex = 0;
      let cardId = 0;
      let interval = setInterval(() => {
        let card: Card|null|undefined = this.stock.draw();
        if (card) {
          Kobbo.players[playerIndex].giveCard(card);
          playerIndex++;
          if (playerIndex === Kobbo.players.length) {
            playerIndex = 0;
            cardId++;
          }
          if (playerIndex === 0 && cardId == Kobbo.players.length) {
            clearInterval(interval);
            resolve();
          }
        }
      }, DEAL_SPEED*1000);
    });
  }

  drawCard() {
    let card = this.stock.draw();
    if (card) {
      this.drawnCard = card;
      card.showCard(true);
      card.zoom = 2;
      card.x = this.board.width/2 - card.width/2;
      card.y = this.board.height/2 - card.height/2;
      card.rotate = (Kobbo.player.index) * -90;
      this.gametable.addEntity(card);
    }
  }

  discardCardFromPlayer(i: number, card: Card) {
    let player = Kobbo.players[i];
    console.log("Discarding card from " + player.name);
    Kobbo.players[i].removeCard(card);
    this.sendToWaste(card);
  }

  sendToWaste(card: Card) {
    let wasteSpace = this.waste.space as Entities.Container;
    card.reset();
    card.rotate = this.random.intBetween(-5, 5);
    card.showCard(true);
    card.x = wasteSpace.width / 2 - card.width/2;
    card.y = wasteSpace.height / 2 - card.height / 2;
    card.zoom = 1;
    this.waste.space?.addEntity(card);
  }

  update(delta: number) {
    super.update(delta);
    // FPS
    this.FPSUpdate.count += delta;
    if (this.FPSUpdate.count >= this.FPSUpdate.limit) {
      this.FPSLabel.text = `FPS: ${Math.round(1000/delta)} | Entities: ${this.board.countEntities()}`;
      this.FPSLabel.x = this.board.width - this.FPSLabel.width - 10;
      this.FPSUpdate.count = 0;
      this.debugService.set("GameState", this.gameState, "gamestate");
      this.debugService.set("CardPower", (this.drawnCard ? this.drawnCard.power : "none"), "cardpower");
      this.debugService.set("SwitchingCard", (this.switchingCard ? this.switchingCard.name : "none"), "switchingcard");
    }
  }
}

export let GameState = {
  DEALING: 'dealing',
  GAME_WILL_START: 'game_will_start',
  OTHER_PLAYER_PLAYING: 'current_player_draw',//'other_player_playing',
  CURRENT_PLAYER_DRAW: 'current_player_draw',
  CURRENT_PLAYER_DRAWN: 'current_player_drawn',
  USE_POWER : 'use_power',
  WAIT : 'wait',
  GAME_END: 'game_end'
}
