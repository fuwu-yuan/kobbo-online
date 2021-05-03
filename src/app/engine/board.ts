import {ElementRef} from "@angular/core";
import {Entity} from "./entity";
import {Config} from "../services/config.service";

export class Board {
  canvas: ElementRef<HTMLCanvasElement>;
  entities: Entity[] = [];
  private _ctx: CanvasRenderingContext2D | null;
  private runningInterval: number | undefined;
  private _config;

  constructor(canvas: ElementRef<HTMLCanvasElement>, config: Config) {
    this.canvas = canvas;
    this._ctx = this.canvas.nativeElement.getContext('2d');
    this._config = config;
    this.initEvents();
  }

  start() {
    this.runningInterval = setInterval(() => {
      this.update();
      this.draw();
    }, 1000/this._config.game.FPS);
  }

  stop() {
    clearInterval(this.runningInterval);
  }

  addEntity(entity: Entity) {
    this.entities.push(entity);
  }

  removeEntity(entity: Entity) {
    const index: number = this.entities.indexOf(entity, 0);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  }

  /**
   * Remove all entities (empty the board)
   */
  reset() {
    this.entities = [];
    this.ctx?.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
  }

  get ctx() {
    return this._ctx;
  }

  private onMouseEvent(event: MouseEvent) {
    event.preventDefault();
    const rect = this.canvas.nativeElement.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    this.entities.forEach(function (entity: Entity) {
      if (entity.intersect(x, y)) {
        if (event.type === "mousemove") {
          entity.hovered = true;
        }
        entity.dispatcher.dispatch(event.type, event);
      }else {
        if (event.type === "mousemove") {
          entity.hovered = false;
        }
      }
    });
  }

  private initEvents() {
    this.canvas.nativeElement.addEventListener('click', this.onMouseEvent.bind(this));
    this.canvas.nativeElement.addEventListener('contextmenu', this.onMouseEvent.bind(this));
    this.canvas.nativeElement.addEventListener('dblclick', this.onMouseEvent.bind(this));
    this.canvas.nativeElement.addEventListener('mousedown', this.onMouseEvent.bind(this));
    this.canvas.nativeElement.addEventListener('mouseenter', this.onMouseEvent.bind(this));
    this.canvas.nativeElement.addEventListener('mouseleave', this.onMouseEvent.bind(this));
    this.canvas.nativeElement.addEventListener('mousemove', this.onMouseEvent.bind(this));
    this.canvas.nativeElement.addEventListener('mouseout', this.onMouseEvent.bind(this));
    this.canvas.nativeElement.addEventListener('mouseover', this.onMouseEvent.bind(this));
    this.canvas.nativeElement.addEventListener('mouseup', this.onMouseEvent.bind(this));
  }

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

  draw() {
    let self = this;
    if (this.canvas && this.ctx) {
      /* Clear canvas */
      this.ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.entities.forEach(function(entity: Entity) {
        self.ctx?.save();
        self.ctx?.translate(entity.translate.x, entity.translate.y);
        entity.draw(self.ctx as CanvasRenderingContext2D);
        self.ctx?.restore();
      });
    }
  }
}
