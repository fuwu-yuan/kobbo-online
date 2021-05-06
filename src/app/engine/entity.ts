import {Dispatcher} from "../classes/Dispatcher";
import {Board} from "./board";

/**
 * The most important part of your game
 * To build a game, you need to create entities and add it to your board
 *
 */
export abstract class Entity {
  private _translate: {x: number, y:number} = {x: 0, y:0};
  private _x: number;
  private _y: number;
  private _width: number;
  private _height: number;
  private _dispatcher = new Dispatcher();
  private _board: Board | null = null;
  public hovered: boolean = false;

  constructor(x: number, y: number, width: number, height: number) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
  }

  get board(): Board | null {
    return this._board;
  }

  set board(value: Board | null) {
    this._board = value;
  }

  get translate() {
    return this._translate;
  }

  set translate(translate) {
    this._translate = translate;
  }

  get x() {
    return this._x;
  }

  set x(value) {
    this._x = value;
  }

  get y() {
    return this._y;
  }

  set y(value) {
    this._y = value;
  }

  get height(): number {
    return this._height;
  }

  set height(value: number) {
    this._height = value;
  }
  get width(): number {
    return this._width;
  }

  set width(value: number) {
    this._width = value;
  }

  get dispatcher() {
    return this._dispatcher;
  }

  intersect(x: number, y: number): boolean {
    return x >= (this.x + this.translate.x) && x <= (this.x + this.translate.x) + this.width &&
      y >= (this.y + this.translate.y) && y <= (this.y + this.translate.y) + this.height;
  }

  intersectWithEntity(entity: Entity): boolean {
    return ((this.x + this.translate.x) < (entity.x + entity.translate.x) + entity.width &&
      (this.x + this.translate.x) + this.width > (entity.x + entity.translate.x) &&
      (this.y + this.translate.y) < (entity.y + entity.translate.y) + entity.height &&
      this.height + (this.y + this.translate.y) > (entity.y + entity.translate.y));
  }

  /**
   * Listen mouse event on this entity
   * @param event An event from this list : click, dblclick, contextmenu, mousedown, mouseup, mouseenter, mouseleave, mousemove
   * @param callback
   */
  onMouseEvent(event: "click" | "dblclick" | "contextmenu" | "mousedown" | "mouseup" | "mouseenter" | "mouseleave" | "mousemove", callback: (event: MouseEvent) => void) {
    this.dispatcher.on(event, callback);
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;
  abstract update(): void;
}
