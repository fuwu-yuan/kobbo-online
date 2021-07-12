import {Card, Colors, Names, Powers, PowersHelp} from "../models/card";
import {Stock} from "../models/stock";
import {Board, Entities, GameStep, Network} from "@fuwu-yuan/bgew";
import {Kobbo} from "../game/Kobbo";
import {create as randomseed, RandomSeed} from 'random-seed';
import {Waste} from "../models/waste";
import {MessagesService} from "../services/messages.service";
import {DebugService} from "../services/debug.service";
import {Player} from "../models/player";
import {KobboConfig} from "../game/kobboConfig";
import {ServerSide} from "../game/serverside";

const DEBUG: boolean = false;
const GAME_WILL_START_DURATION: number = 10; // seconds
const WATCH_CARD_DURATION: number = 5; // seconds
const END_GAME_REVEAL_TIME: number = 5; // seconds
const DEAL_SPEED: number = 0.5; // seconds

export class InGameStep extends GameStep {
  name: string = "ingame";

  // FPS
  private FPSLabel: Entities.Label;
  private FPSUpdate: any = {limit: 1000, count: 0};

  // Stock and Waste
  private stock: Stock;
  private waste: Waste;

  // Containers and Entities
  private gametable: Entities.Container;
  private centerSpace: Entities.Container;
  private drawnCard: Card|null = null;
  private switchingCard: Card|null = null;
  private kobboButton: Entities.Button|null = null;

  // Random
  private randomseed: RandomSeed;

  // Messages and Debug
  private messagesService;
  private debugService;

  // Other
  private gameState: any;
  private serverSide: ServerSide|null = null;
  private spacePos: {x: number, y: number, deg: number}[] = [];
  private playingPlayer: Player|null = null;
  private canCutGame: boolean = true;

  constructor(board: Board) {
    super(board);
    this.stock = new Stock();
    this.waste = new Waste();
    this.randomseed = randomseed();
    this.gametable = new Entities.Container(0, 0, board.width, board.height);
    this.centerSpace = new Entities.Container(0, 0, 0, 0);
    this.FPSLabel = new Entities.Label(this.board.width - 60, 10, "FPS: -", this.board.ctx);
    this.FPSLabel.fontSize = 14;
    this.FPSLabel.fontColor = "black";
    this.FPSLabel.visible = false;
    this.board.debug.skeleton = DEBUG;
    this.messagesService = MessagesService.getInstance();
    this.debugService = DebugService.getInstance();
    if (DEBUG) {
      this.debugService.show();
      this.FPSLabel.visible = true;
    }
    this.board.onKeyboardEvent("keydown", (event: KeyboardEvent) => {
      if (event.key === "f" && event.ctrlKey) {
        this.FPSLabel.visible = !this.FPSLabel.visible;
      }
    })
  }

  async onEnter(data: any) {
    console.log("Entering InGame");
    this.randomseed.seed(data.data.seed);
    this.initChat();
    console.log(Kobbo.players);
    this.initGame();
    this.initBoard();
    this.initEvents();
    this.board.addEntity(this.FPSLabel);
    await this.deal();
    await this.gameWillStart();
    this.createKobboButton();

    this.debugService.set("User uid", Kobbo.player.__toString(), "user_uid");

    this.changeGameState(GameState.WAIT);
    if (Kobbo.player === Kobbo.sortedPlayers()[0]) {
      this.serverSide = new ServerSide(this.board);
      this.serverSide.nextPlayer().then((response: Network.SocketMessage) => {
        this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
      });
    }
  }

  initChat() {
    this.messagesService.show();
    this.messagesService.onMessageSent(this.onMessageSent.bind(this));
  }

  onMessageSent(message: string) {
    this.board.networkManager.sendMessage({
      action: "chat",
      data: {
        username: Kobbo.player.name,
        message: message
      }
    }).then((response: Network.SocketMessage) => {
      this.messagesService.add(Kobbo.player.name, message);
    });
  }

  onLeave(): void {
    this.messagesService.clear();
    this.messagesService.hide();
    this.messagesService.offMessageSent(this.onMessageSent.bind(this));
  }

  changeGameState(state: string) {
    if (this.kobboButton) {
      if (state === GameState.CURRENT_PLAYER_DRAW) { this.kobboButton.visible = true; }
      if (state === GameState.CURRENT_PLAYER_DRAWN) { this.kobboButton.visible = false; }
    }
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
      this.kobboButton = new Entities.Button(
        player.space.width / 4  - buttonSize.width / 2,
        player.space.height / 2 - buttonSize.height / 2,
        buttonSize.width,
        buttonSize.height,
        "KOBBO"
      );
      this.kobboButton.fontSize = 16;
      // Normal
      this.kobboButton.strokeColor = "rgba(230,77,59, 1.0)";
      this.kobboButton.fontColor = "rgba(230,77,59, 1.0)";
      // Hover
      this.kobboButton.hoverFillColor = "rgba(230,77,59, 1.0)";
      this.kobboButton.hoverFontColor = "white";
      this.kobboButton.hoverCursor = "pointer";
      // Clicked
      this.kobboButton.clickStrokeColor = "rgba(230,37,39, 1.0)";
      this.kobboButton.clickFillColor = "rgba(230,37,39, 1.0)";
      this.kobboButton.clickFontColor = "white";

      let undo: any = null;
      this.kobboButton.onMouseEvent("click", () => {
        if (this.kobboButton) {
          if (this.kobboButton.text.indexOf("KOBBO") > -1) {
            this.kobboButton.text = "SÛR ?!";
            undo = setTimeout(() => {
              if (this.kobboButton) {
                this.kobboButton.text = "KOBBO";
              }
            }, 5000);
          }else {
            if (undo) {
              clearTimeout(undo);
            }
            player.space?.removeEntity(this.kobboButton);
            this.changeGameState(GameState.WAIT);
            this.sendEventToServer("kobbo", { player: Kobbo.player.uid })
              .then((response: Network.SocketMessage) => {
                this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
              });
          }
        }
      });

      this.kobboButton.visible = false;
      player.space.addEntity(this.kobboButton);
    }
  }

  endOfGame(player: Player) {
    if (player.space) {
      this.changeGameState(GameState.GAME_END);
      let uid = this.messagesService.add("Kobbo", "Le jeu de " + player.name + " sera révélé dans "+END_GAME_REVEAL_TIME+" secondes", true);
      let i = 0;

      let failLabel = new Entities.Label(0, 0, "PERDU", this.board.ctx);
      failLabel.rotate = this.spacePos[Kobbo.player.index].deg;
      failLabel.fontColor = "red";

      let successLabel = new Entities.Label(0, 0, "GAGNÉ", this.board.ctx);
      successLabel.fontColor = "green";
      successLabel.rotate = this.spacePos[Kobbo.player.index].deg;

      failLabel.fontSize = successLabel.fontSize = 60;
      failLabel.x = successLabel.x = player.space.width / 4 - failLabel.width / 2;
      failLabel.y = successLabel.y = player.space.height / 2 - failLabel.height / 2;

      let timer = setInterval(() => {
        i++;
        this.messagesService.edit(uid, "Kobbo", "Le jeu de " + player.name + " sera révélé dans "+ (END_GAME_REVEAL_TIME-i)  +" seconde" + ((END_GAME_REVEAL_TIME-i) > 1 ? "s" : ""));
        if (i === END_GAME_REVEAL_TIME) {
          clearInterval(timer);
          let total = 0;
          let detailPoints = "";
          for (const card of player.cards) {
            if (card) {
              card.showCard(true);
              detailPoints += card.name + "("+card.value+") ";
              total += card.value;
            }
          }
          if (total <= KobboConfig.GAME_RULES.MIN_VALUE_TO_WIN) {
            player.space?.addEntity(successLabel);
            this.messagesService.add("Kobbo", player.name + " à gagné ! Total des points : " + total + " [" + detailPoints + "]", true);
          }else {
            player.space?.addEntity(failLabel);
            this.messagesService.add("Kobbo", player.name + " à perdu ! Total des points : " + total + " [" + detailPoints + "]" + ". Il devait faire " + KobboConfig.GAME_RULES.MIN_VALUE_TO_WIN + " ou moins.", true);
          }

          // Reveal self cards button
          if (Kobbo.player !== player) {
            if (this.centerSpace) {
              let size = {
                width : this.centerSpace.width - 20,
                height: 30
              };
              let reveal = new Entities.Button(this.board.width / 2 - size.width / 2, this.board.height / 2 - size.height - 10, size.width, size.height, "Révéler mes cartes");
              reveal.fontSize = 20;
              // Normal
              reveal.strokeColor = "rgba(230,77,59, 1.0)";
              reveal.fontColor = "rgba(230,77,59, 1.0)";
              reveal.fillColor = "rgba(255, 255, 255, 0.5)";
              // Hover
              reveal.hoverFillColor = "rgba(230,77,59, 1.0)";
              reveal.hoverFontColor = "white";
              reveal.hoverCursor = "pointer";
              // Clicked
              reveal.clickStrokeColor = "rgba(230,37,39, 1.0)";
              reveal.clickFillColor = "rgba(230,37,39, 1.0)";
              reveal.clickFontColor = "white";
              this.board.addEntity(reveal);
              reveal.onMouseEvent("click", () => {
                this.board.removeEntity(reveal);
                this.sendEventToServer("end_reveal_cards", { player: Kobbo.player.uid })
                  .then((response: Network.SocketMessage) => {
                    this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
                  });
              });
            }
          }

          // EXIT BUTTON
          if (this.centerSpace) {
            let size = {
              width : this.centerSpace.width - 20,
              height: 30
            };
            let exit = new Entities.Button(this.board.width / 2 - size.width / 2, this.board.height / 2 + 10, size.width, size.height, "Quitter");
            exit.fontSize = 20;
            // Normal
            exit.strokeColor = "rgba(230,77,59, 1.0)";
            exit.fontColor = "rgba(230,77,59, 1.0)";
            exit.fillColor = "rgba(255, 255, 255, 0.5)";
            // Hover
            exit.hoverFillColor = "rgba(230,77,59, 1.0)";
            exit.hoverFontColor = "white";
            exit.hoverCursor = "pointer";
            // Clicked
            exit.clickStrokeColor = "rgba(230,37,39, 1.0)";
            exit.clickFillColor = "rgba(230,37,39, 1.0)";
            exit.clickFontColor = "white";
            this.board.addEntity(exit);
            exit.onMouseEvent("click", () => {
              this.board.removeEntity(exit);
              this.board.networkManager.leaveRoom();
              this.board.moveToStep("main");
            });
          }
        }
      }, 1000);
    }
  }

  gameWillStart(): Promise<void> {
    let msgUid = this.messagesService.add("Kobbo", "La partie va commencer, vous avez " + GAME_WILL_START_DURATION + " secondes pour regarder vos 2 cartes du bas", true);
    let i = 0;
    return new Promise((resolve) => {
      this.changeGameState(GameState.GAME_WILL_START);
      let counter = setInterval(() => {
        i++;
        this.messagesService.edit(msgUid, null, "La partie va commencer, vous avez " + (GAME_WILL_START_DURATION-i) + " seconde"+((GAME_WILL_START_DURATION-i) > 1 ? "s" : "")+" pour regarder vos 2 cartes du bas");
        if (i === GAME_WILL_START_DURATION) {
          clearInterval(counter);
          this.changeGameState(GameState.WAIT);
          for (const player of Kobbo.players) {
            for (const card of player.cards) {
              card?.showCard(false);
            }
          }
          resolve();
        }
      }, 1000);
    });
  }

  initGame(): void {
    this.stock.initStock(this.randomseed.random);
  }

  initEvents() {
    // WASTE CLICKED [OK]
    this.waste.space?.onMouseEvent("click", () => {

      // SEND TO WASTE [OK]
      if (this.gameState === GameState.CURRENT_PLAYER_DRAWN) {
        this.sendEventToServer("send_drawn_card_to_waste", { player: Kobbo.player.uid })
          .then((response: Network.SocketMessage) => {
            this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
          });

        // NOT USE POWER [OK]
      }else if (this.gameState === GameState.USE_POWER) {
        this.sendEventToServer("not_use_power", { player: Kobbo.player.uid })
          .then((response: Network.SocketMessage) => {
            this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
          });
      }
    });

    // ANY CARD CLICKED [OK]
    for (const card of this.stock) {

      // DOUBLE CLICK
      card.onMouseEvent("dblclick", (event: MouseEvent) => {

        // CLICK ON OWNED CARD [OK]
        if (card.owner === Kobbo.player) {

          if (this.canCutGame && this.waste.length > 0) {
            this.sendEventToServer("cut_game", { player: Kobbo.player.uid, card: Kobbo.player.findCardIndex(card)})
              .then((response: Network.SocketMessage) => {
                this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
              });
          }
        }
      });

      // CLICK EVENT
      card.onMouseEvent("click", (event: MouseEvent) => {

        // DEBUG [OK]
        this.debugService.set("Last clicked card", card.__toString(), "lastclickedcard");

        // CLICK ON OWNED CARD [OK]
        if (card.owner === Kobbo.player) {

          // GAME WILL START STATUS [OK]
          if (this.gameState === GameState.GAME_WILL_START) {
            // Card clicked is first or second card
            if (card === Kobbo.player.cards[0] || card === Kobbo.player.cards[1]) {
              this.sendEventToServer("watch_card", {
                player: Kobbo.player.uid,
                card: Kobbo.player.findCardIndex(card),
                show: !card.cardVisible
              })
                .then((response: Network.SocketMessage) => {
                  this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
                });
            }

            // CARD DRAWN STATUS [OK]
          } else if (this.gameState === GameState.CURRENT_PLAYER_DRAWN) {
            if (this.drawnCard) {
              this.sendEventToServer("take_drawn_card", { player: Kobbo.player.uid, replacedCard: Kobbo.player.findCardIndex(card)})
                .then((response: Network.SocketMessage) => {
                  this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
                });
            }

            // USE POWER [OK]
          } else if (this.gameState === GameState.USE_POWER) {

            // POWER : WATCH SELF [OK]
            if (this.drawnCard?.power === Powers.WATCH_SELF) {
              this.sendEventToServer("power_watch_self", { player: Kobbo.player.uid, card: card.owner.findCardIndex(card)})
                .then((response: Network.SocketMessage) => {
                  this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
                });

              // POWER : BLIND SWITCH [OK]
            }else if (this.drawnCard?.power === Powers.BLIND_SWITCH) {
              this.sendEventToServer("power_blind_switch", { player: Kobbo.player.uid, card: Kobbo.player.findCardIndex(card), step: "self_card" })
                .then((response: Network.SocketMessage) => {
                  this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
                });

              // POWER : KING SWITCH [OK]
            }else if (this.drawnCard?.power === Powers.KING_SWITCH) {

              // SWITCHING [OK]
              if (this.switchingCard !== null) {
                this.sendEventToServer("power_king_switch", { player: Kobbo.player.uid, card: Kobbo.player.findCardIndex(card), step: "switch" })
                  .then((response: Network.SocketMessage) => {
                    this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
                  });

                // NOT SWITCHING [OK]
              }else {
                this.messagesService.add("Kobbo", "Vous devez d'abbord sélectionner la carte d'un adversaire", true);
              }
            }
          }

          // CLICK OTHER PLAYER CARD [OK]
        }else if (card.owner !== null && card.owner !== Kobbo.player) {

          // USE POWER [OK]
          if (this.gameState === GameState.USE_POWER) {

            // POWER : WATCH OTHER [OK]
            if (this.drawnCard?.power === Powers.WATCH_OTHER) {
              this.changeGameState(GameState.WAIT);
              this.sendEventToServer("power_watch_other", { player: Kobbo.player.uid, otherPlayer: card.owner.uid, card: card.owner.findCardIndex(card) })
                .then((response: Network.SocketMessage) => {
                  this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
                });

              // POWER : BLIND SWITCH [OK]
            } else if (this.drawnCard?.power === Powers.BLIND_SWITCH) {
              this.sendEventToServer("power_blind_switch", { player: card.owner.uid, card: card.owner.findCardIndex(card), step: "other_card" })
                .then((response: Network.SocketMessage) => {
                  this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
                });
            }

            // POWER : KING SWITCH [OK]
            else if (this.drawnCard?.power === Powers.KING_SWITCH) {

              // CHOOSE WITCH CARD TO SHOW [OK]
              if (this.switchingCard === null) {
                this.sendEventToServer("power_king_switch", { playingPlayer: Kobbo.player.uid, player: card.owner.uid, card: card.owner.findCardIndex(card), step: "watch_other" })
                  .then((response: Network.SocketMessage) => {
                    this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
                  });
                this.messagesService.add("Kobbo", "Si vous voulez échanger la carte, cliquez sur l'une des votre, sinon retournez-la à nouveau pour la laisser au joueur", true);
              }
              // WILL NOT SWITCH [OK]
              else {
                this.sendEventToServer("power_king_switch", { playingPlayer: Kobbo.player.uid, player: card.owner.uid, card: card.owner.findCardIndex(card), step: "abort" })
                  .then((response: Network.SocketMessage) => {
                    this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
                  });
              }
            }
          }

          // CLICK ON FIRST CARD ON STOCK [OK]
        }else if (card === this.stock.topCard()) {
          if (this.gameState === GameState.CURRENT_PLAYER_DRAW) {
            this.sendEventToServer("draw_card", { player: Kobbo.player.uid })
              .then((response: Network.SocketMessage) => {
                this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
                this.changeGameState(GameState.CURRENT_PLAYER_DRAWN);
              });
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
    this.spacePos = [
      { x: spaceSize.width, y: spaceSize.height*2, deg: 0 },
      { x: 0 - spaceSize.width/2, y: spaceSize.height + spaceSize.height/2, deg: 90},
      { x: 0, y: 0, deg: 180 },
      { x: spaceSize.width*2 - spaceSize.width/2, y: spaceSize.height/2, deg: 270 }
    ];

    if (Kobbo.players.length === 2) {
      this.spacePos = [
        { x: spaceSize.width, y: spaceSize.height*2, deg: 0 },
        { x: 0, y: 0, deg: 180 },
      ];
    }

    /* Add players */
    for (const player of Kobbo.sortedPlayers()) {
      let playerSpace = new Entities.Container(this.spacePos[player.index].x, this.spacePos[player.index].y, spaceSize.width*2, spaceSize.height);
      let background = new Entities.Square(0, 0, playerSpace.width, playerSpace.height, DEBUG ? ["red", "blue", "green", "black"][player.index] : "lightgray", "transparent");
      playerSpace.rotate = this.spacePos[player.index].deg;
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
    let background = new Entities.Square(0, 0, spaceSize.width, spaceSize.height,  "lightgray", "transparent");
    this.centerSpace.addEntity(background);
    this.centerSpace.addEntities([stockSpace, wasteSpace]);
    this.gametable.addEntity(this.centerSpace);

    this.stock.space = stockSpace;
    this.waste.space = wasteSpace;
    for (const card of this.stock.slice().reverse()) {
      card.x = this.stock.space.width / 2 - card.width/2;
      card.y = this.stock.space.height / 2 - card.height / 2;
      card.rotate = this.randomseed.intBetween(-5, 5);
      this.stock.space.addEntity(card);
    }

    /* Set table orientation */
    this.gametable.rotate = this.spacePos[Kobbo.player.index].deg * -1;
    this.board.addEntity(this.gametable);
  }

  deal(): Promise<void> {
    this.messagesService.add("Kobbo", "Distribution des cartes", true);
    return new Promise((resolve) => {
      this.changeGameState(GameState.DEALING);
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
          if (playerIndex === 0 && cardId == 4) {
            clearInterval(interval);
            resolve();
          }
        }
      }, DEAL_SPEED*1000);
    });
  }

  sendDrawnCardToWaste(player: Player) {
    if (this.drawnCard !== null) {
      this.gametable.removeEntity(this.drawnCard);
      this.sendToWaste(this.drawnCard);
      if (this.drawnCard.power !== null) {
        if (player === Kobbo.player) {
          this.changeGameState(GameState.USE_POWER);
          // @ts-ignore
          this.messagesService.add("Kobbo", "Vous pouvez utiliser le pouvoir: " + PowersHelp[this.drawnCard.power], true);
          this.messagesService.add("Kobbo", "Pour ne pas utiliser le pouvoir cliquez à nouveau sur la défausse", true);
        }else {
          // @ts-ignore
          this.messagesService.add("Kobbo", player.name + " peut utiliser le pouvoir: " + PowersHelp[this.drawnCard.power], true);
          this.changeGameState(GameState.WAIT);
        }
      }else {
        if (this.serverSide) {
          this.serverSide.nextPlayer().then((response: Network.SocketMessage) => {
            this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
          });
        }
      }
    }
  }

  replaceCardByDrawn(player: Player, card: Card): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.drawnCard) {
        let i = player.removeCard(card);
        this.sendToWaste(card);
        player.giveCard(this.drawnCard, i);
        this.gametable.removeEntity(this.drawnCard);
        this.drawnCard.showCard(true, player !== Kobbo.player);
        setTimeout(() => {
          this.drawnCard?.showCard(false);
          resolve();
        }, 2000);
      }
    });
  }

  drawCard(sensored = false) {
    let card = this.stock.draw();
    if (card) {
      this.drawnCard = card;
      card.showCard(true, sensored);
      card.zoom = 2;
      card.x = this.board.width/2 - card.width/2;
      card.y = this.board.height/2 - card.height/2;
      card.rotate = (this.playingPlayer === Kobbo.player) ? this.spacePos[Kobbo.player.index].deg * -1 : 0;
      this.gametable.addEntity(card);
    }

    if (this.stock.length === 0) {
      this.switchWasteAndStock();
    }
  }

  switchWasteAndStock() {
    this.messagesService.add("Kobbo", "La pioche est vide, je retourne et mélange la défausse.", true);
    let lastCard = this.waste.pop();
    while (this.waste.length > 0) {
      let card = this.waste.pop();
      if (card) {
        this.waste.space?.removeEntity(card);
        this.stock.push(card);
      }
    }
    this.stock.shuffle(this.randomseed.random);
    if (this.stock.space) {
      for (const card of this.stock.slice().reverse()) {
        card.showCard(false);
        card.x = this.stock.space.width / 2 - card.width/2;
        card.y = this.stock.space.height / 2 - card.height / 2;
        card.rotate = this.randomseed.intBetween(-5, 5);
        this.stock.space.addEntity(card);
      }
    }
    if (lastCard) {
      this.waste.push(lastCard);
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
    card.rotate = this.randomseed.intBetween(-5, 5);
    card.showCard(true);
    card.x = wasteSpace.width / 2 - card.width/2;
    card.y = wasteSpace.height / 2 - card.height / 2;
    card.zoom = 1;
    card.owner = null;
    this.waste.push(card);
    this.waste.space?.addEntity(card);
    this.canCutGame = true;
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

  sendEventToServer(eventName: string, data: any): Promise<Network.SocketMessage> {
    return this.board.networkManager.sendMessage({
      event: eventName,
      data: data
    });
  }

  onGameEvent(event: string, data: any) {
    console.log("Event: " + event);
    console.log("Data: ", data);

    if (event === "next_player") {
      let player = Kobbo.findPlayerByUid(data.player);
      if (player) {
        this.playingPlayer = player;
      }
      if (player === Kobbo.player) {
        this.messagesService.add("Kobbo", "C'est à vous de jouer", true);
        this.changeGameState(GameState.CURRENT_PLAYER_DRAW);
      }else if (player) {
        this.messagesService.add("Kobbo", "C'est à " + this.playingPlayer?.name + " de jouer", true);
        this.changeGameState(GameState.OTHER_PLAYER_PLAYING);
      }
    }

    else if (event === "watch_card") {
      let player = Kobbo.findPlayerByUid(data.player);
      if (player) {
        let card = player.getCardAt(data.card);
        if (card) {
          if (player === Kobbo.player) {
            card.showCard(data.show);
          } else {
            card.showCard(data.show, true);
          }
        }
      }

    }else if (event === "draw_card") {
      let player = Kobbo.findPlayerByUid(data.player);
      if (player) {
        this.drawCard(player !== Kobbo.player);
      }
    }

    else if (event === "take_drawn_card") {
      this.changeGameState(GameState.WAIT);
      let player = Kobbo.findPlayerByUid(data.player);
      if (player) {
        let replacedCard = player.getCardAt(data.replacedCard);
        if (replacedCard) {
          this.replaceCardByDrawn(player, replacedCard).then(() => {
            if (this.serverSide) {
              this.serverSide.nextPlayer().then((response: Network.SocketMessage) => {
                this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
              });
            }
          });
        }
      }
    }

    else if (event === "send_drawn_card_to_waste") {
      let player = Kobbo.findPlayerByUid(data.player);
      if (player) {
        this.sendDrawnCardToWaste(player);
      }
    }

    else if (event === "not_use_power") {
      this.changeGameState(GameState.WAIT);
      let player = Kobbo.findPlayerByUid(data.player);
      if (player) {
        if (player === Kobbo.player) {
          this.messagesService.add("Kobbo", "Vous n'utilisez pas le pouvoir.", true);
        }else {
          this.messagesService.add("Kobbo", player.name + " n'utilise pas le pouvoir.", true);
        }
        if (this.serverSide) {
          this.serverSide.nextPlayer().then((response: Network.SocketMessage) => {
            this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
          });
        }
      }
    }

    else if (event === "power_watch_self") {
      let player = Kobbo.findPlayerByUid(data.player);
      if (player) {
        let card = player.getCardAt(data.card);
        if (card) {
          card.showCard(true, player !== Kobbo.player);
          this.changeGameState(GameState.WAIT);
          setTimeout(() => {
            card?.showCard(false);
            if (this.serverSide) {
              this.serverSide.nextPlayer().then((response: Network.SocketMessage) => {
                this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
              });
            }
          }, WATCH_CARD_DURATION * 1000);
        }
      }
    }

    else if (event === "power_blind_switch") {
      let player = Kobbo.findPlayerByUid(data.player);
      if (player) {
        let card = player.getCardAt(data.card);
        if (card) {
          let step = data.step;
          if (step === "self_card") {
            if (this.switchingCard !== null) {
              this.switchingCard.resetBack();
            }
            card.setBackGreen();
            this.switchingCard = card;
          }else if (step === "other_card") {
            if (this.switchingCard !== null) {
              if (player === Kobbo.player) {
                this.changeGameState(GameState.WAIT);
              }
              card.setBackRed();
              setTimeout(() => {
                let self = this.switchingCard?.owner;
                if (player && this.switchingCard && card && self) {
                  let i = player.removeCard(card);
                  player.giveCard(this.switchingCard, i);
                  i = self.removeCard(this.switchingCard);
                  self.giveCard(card, i);
                  card.setBackRed();
                  this.switchingCard.setBackGreen();
                }
                setTimeout(() => {
                  if (this.switchingCard) {
                    this.switchingCard.resetBack();
                  }
                  card?.resetBack();
                  this.switchingCard = null;
                  if (this.serverSide) {
                    this.serverSide.nextPlayer().then((response: Network.SocketMessage) => {
                      this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
                    });
                  }
                }, 1000);
              }, 1000);
            }else {
              this.messagesService.add("Kobbo", "Vous devez d'abbord sélectionner une de vos cartes");
            }
          }
        }
      }
    }

    else if (event === "power_watch_other") {
      let player = Kobbo.findPlayerByUid(data.player);
      let otherPlayer = Kobbo.findPlayerByUid(data.otherPlayer);
      if (player && otherPlayer) {
        let card = otherPlayer.getCardAt(data.card);
        if (card) {
          card.showCard(true, Kobbo.player !== player);
          setTimeout(() => {
            card?.showCard(false);
            if (this.serverSide) {
              this.serverSide.nextPlayer().then((response: Network.SocketMessage) => {
                this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
              });
            }
          }, WATCH_CARD_DURATION * 1000);
        }
      }
    }

    else if (event === "power_king_switch") {
      let player = Kobbo.findPlayerByUid(data.player);
      let step = data.step;
      if (player) {
        let card = player.getCardAt(data.card);
        if (card) {
          if (step === "watch_other") {
            let playingPlayer = Kobbo.findPlayerByUid(data.playingPlayer);
            card.showCard(true, playingPlayer !== Kobbo.player);
            this.switchingCard = card;
          }else if (step === "abort") {
            card.showCard(false);
            this.switchingCard = null;
            if (player === Kobbo.player) {
              this.messagesService.add("Kobbo", "Vous n'avez pas échangé la carte", true);
            }else {
              this.messagesService.add("Kobbo", player.name + " n'a pas échangé la carte", true);
            }
            if (this.serverSide) {
              this.serverSide.nextPlayer().then((response: Network.SocketMessage) => {
                this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
              });
            }
          }else if (step === "switch") {
            this.changeGameState(GameState.WAIT);
            card.setBackGreen();
            setTimeout(() => {
              if (card) {
                let other = this.switchingCard?.owner;
                if (other && player && this.switchingCard) {
                  let i = player.removeCard(card);
                  player.giveCard(this.switchingCard, i);
                  i = other.removeCard(this.switchingCard);
                  other.giveCard(card, i);
                  card.setBackGreen();
                  this.switchingCard.showCard(true, player !== Kobbo.player);
                }
              }
              setTimeout(() => {
                if (card) {
                  if (this.switchingCard) {
                    this.switchingCard.showCard(false);
                  }
                  card.resetBack();
                  this.switchingCard = null;
                  if (this.serverSide) {
                    this.serverSide.nextPlayer().then((response: Network.SocketMessage) => {
                      this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
                    });
                  }
                }
              }, 1000);
            }, 1000);
          }
        }
      }
    }

    else if (event === "kobbo") {
      let player = Kobbo.findPlayerByUid(data.player);
      if (player) {
        this.messagesService.add(player.name, "Kobbo !!!", true);
        this.endOfGame(player);
      }
    }

    else if (event === "end_reveal_cards") {
      let player = Kobbo.findPlayerByUid(data.player);
      if (player) {
        for (const card of player.cards) {
          card?.showCard(true);
        }
      }
    }

    else if (event === "cut_game") {
      let player = Kobbo.findPlayerByUid(data.player);
      if (player) {
        let card = player.getCardAt(data.card);
        if (card) {
          let msgId = this.messagesService.add("Kobbo", player.name + " tente de couper...", true);
          let i = player.removeCard(card);
          this.sendToWaste(card);

          // FAIL
          if (card.name !== this.waste[this.waste.length-2].name) {
            this.messagesService.edit(msgId, "Kobbo", player.name + " tente de couper, mais c'est un echec !");
            setTimeout(() => {
              player?.giveCard(card, i);
              this.waste.pop();
              if (card) {
                this.waste.space?.removeEntity(card);
              }
              card?.showCard(false);
              setTimeout(() => {
                let newCard = this.stock.draw();
                if (newCard) {
                  player?.giveCard(newCard);
                }
              }, 1000);
            }, 1000);
          }

          // SUCCESS
          else {
            this.messagesService.edit(msgId, "Kobbo", player.name + " tente de couper, et c'est un succès ! Vous ne pouvez plus couper jusqu'à la prochaine carte qui sera défaussée");
            if (player !== Kobbo.player) {
              this.canCutGame = false;
            }
          }
        }
      }
    }
  }

  onNetworkMessage(msg: Network.SocketMessage) {
    if (msg.data.msg.event) {
      let event = msg.data.msg.event;
      let data = msg.data.msg.data;
      this.onGameEvent(event, data);
    }
    if (msg.data.msg.action) {
      switch (msg.data.msg.action) {
        case "chat":
          let username = msg.data.msg.data.username;
          let message = msg.data.msg.data.message;
          this.messagesService.add(username, message);
          break;
      }
    }
  }

  onPlayerLeave(msg: Network.SocketMessage) {
    let leftPlayer = Kobbo.findPlayerByUid(msg.sender);
    if (leftPlayer) {
      if (leftPlayer.space) {
        this.gametable.removeEntity(leftPlayer.space);
      }
      Kobbo.removePlayer(leftPlayer);
    }
    if (Kobbo.player === Kobbo.sortedPlayers()[0] && this.serverSide === null) {
      this.serverSide = new ServerSide(this.board);
      if (leftPlayer === this.playingPlayer) {
        this.serverSide.nextPlayer().then((response: Network.SocketMessage) => {
          this.onGameEvent(response.data.msg.msg.event, response.data.msg.msg.data);
        });
      }
    }
  }

  onConnectionClosed() {
    alert("La connexion a été perdue.");
    this.board.moveToStep("main");
  }
}

export let GameState = {
  DEALING: 'dealing',
  GAME_WILL_START: 'game_will_start',
  OTHER_PLAYER_PLAYING: 'other_player_playing',
  CURRENT_PLAYER_DRAW: 'current_player_draw',
  CURRENT_PLAYER_DRAWN: 'current_player_drawn',
  USE_POWER : 'use_power',
  WAIT : 'wait',
  GAME_END: 'game_end'
}
