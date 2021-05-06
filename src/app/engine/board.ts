import {ElementRef} from "@angular/core";
import {Entity} from "./entity";
import {GameStep} from "./gamestep";
import {Config} from "./config";

/**
 * The borad is the main part of your Game
 */
export class Board {
  canvas: ElementRef<HTMLCanvasElement>;
  entities: Entity[] = [];
  private _ctx: CanvasRenderingContext2D;
  private runningInterval: number | undefined;
  private _config;
  private defaultStrokeStyle: string | CanvasGradient | CanvasPattern;
  private defaultFillStyle: string | CanvasGradient | CanvasPattern;
  private steps: { [key: string]: GameStep; } = {};
  private _step: GameStep|null = null;

  constructor(canvas: ElementRef<HTMLCanvasElement>, config: Config) {
    this.canvas = canvas;
    this._ctx = this.canvas.nativeElement.getContext('2d') as CanvasRenderingContext2D;
    this.defaultStrokeStyle = this.ctx.strokeStyle;
    this.defaultFillStyle = this.ctx.fillStyle;
    this._config = config;
    this.initEvents();
  }

  /**
   * Start the game loop (update and draw entities)
   */
  start() {
    this.step.onEnter({});
    this.runningInterval = setInterval(() => {
      this.update();
      this.draw();
    }, 1000/this._config.game.FPS);
  }

  /**
   * Stop the game loop (game will freeze)
   */
  stop() {
    clearInterval(this.runningInterval);
  }

  /**
   * Add a step in step list (you need to add your game step before calling moveToStep(step))
   * @param step
   */
  addStep(step: GameStep) {
    this.steps[step.name] = step;
  }

  /**
   * Add an array of steps (you need to add your game step before calling moveToStep(step))
   * @param steps
   */
  addSteps(steps: GameStep[]) {
    steps.forEach((step: GameStep) => {
      this.addStep(step);
    })
  }

  /**
   * Get the current step
   */
  get step(): GameStep {
    return this._step as GameStep;
  }

  /**
   * Set the current step (no transitions function is called (onEnter / onLeave))
   *
   * @param step
   */
  set step(step: GameStep) {
    this._step = step;
  }

  /**
   * The the game config
   */
  get config(): Config {
    return this._config;
  }

  /**
   * Change the game step (will call onLeave of current step, and onEnter on new step)
   * @param step
   * @param data
   */
  moveToStep(step: string, data: any = {}) {
    if (this.step) {
      this.step.onLeave();
    }
    this.reset();
    this.step = this.steps[step];
    if (this.step) {
      this.step.onEnter(data);
    }else {
      console.error("No step found with name '" + step + "'");
    }
  }

  /**
   * Add an entity to the board.
   * Entity will be updated and drawn immediately (calling update() and draw() from entity)
   *
   * @param entity
   */
  addEntity(entity: Entity) {
    entity.board = this;
    this.entities.push(entity);
  }

  /**
   * Remove the entity from board.
   * The entity will disappear from the game
   * @param entity
   */
  removeEntity(entity: Entity) {
    const index: number = this.entities.indexOf(entity, 0);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  }

  /**
   * Change the cursor
   * @param cursor
   */
  changeCursor(cursor: string) {
    document.body.style.cursor = cursor;
  }

  /**
   * Remove all entities and clear the board
   */
  reset() {
    this.entities = [];
    this.clear()
    document.body.style.cursor = "default";
  }

  /**
   * Clear the board (will be drawn again on next game loop)
   */
  public clear() {
    this.ctx?.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    this.ctx?.beginPath();
  }

  /**
   * Get the CanvasRenderingContext2D to draw
   */
  get ctx() {
    return this._ctx;
  }

  /**
   * Reset all styles (stroke and fill)
   */
  resetStyles() {
    this.ctx.strokeStyle = this.defaultStrokeStyle;
    this.ctx.fillStyle = this.defaultFillStyle;
  }

  /**
   * On mouse event, catch it and dispatch right event to entities
   *
   * @param event
   * @private
   */
  private onMouseEvent(event: MouseEvent) {
    event.preventDefault();
    const rect = this.canvas.nativeElement.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    this.entities.forEach(function (entity: Entity) {
      if (entity.intersect(x, y)) {
        if (event.type === "mousemove") {
          if (!entity.hovered) {
            entity.hovered = true;
            entity.dispatcher.dispatch("mouseenter");
          }
        }
        entity.dispatcher.dispatch(event.type, event);
      }else {
        if (event.type === "mousemove") {
          if (entity.hovered) {
            entity.hovered = false;
            entity.dispatcher.dispatch("mouseleave");
          }
        }
      }
    });
  }

  /**
   * Init all events from the board
   *
   * @private
   */
  private initEvents() {
    this.canvas.nativeElement.addEventListener('click', this.onMouseEvent.bind(this));
    this.canvas.nativeElement.addEventListener('dblclick', this.onMouseEvent.bind(this));

    this.canvas.nativeElement.addEventListener('contextmenu', this.onMouseEvent.bind(this));

    this.canvas.nativeElement.addEventListener('mousedown', this.onMouseEvent.bind(this));
    this.canvas.nativeElement.addEventListener('mouseup', this.onMouseEvent.bind(this));

    this.canvas.nativeElement.addEventListener('mouseenter', this.onMouseEvent.bind(this));
    this.canvas.nativeElement.addEventListener('mouseleave', this.onMouseEvent.bind(this));

    this.canvas.nativeElement.addEventListener('mousemove', this.onMouseEvent.bind(this));

    //TODO keyboard events
  }

  /**
   * Game update loop
   */
  update() {
    //TODO ajouter le delta pour le update
    // Update entities
    let self = this;
    if (this.canvas && this.ctx) {
      this.entities.forEach(function(entity: Entity) {
        entity.update();
      });
    }
  }

  /**
   * Game draw loop
   */
  draw() {
    let self = this;
    if (this.canvas) {
      /* Clear canvas */
      this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.clear();
      this.entities.forEach(function(entity: Entity) {
        self.resetStyles();
        self.ctx.save();
        self.ctx.translate(entity.translate.x, entity.translate.y);
        entity.draw(self.ctx as CanvasRenderingContext2D);
        self.ctx.restore();
      });
    }
  }
}
