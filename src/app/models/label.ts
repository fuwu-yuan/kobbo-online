import {Entity} from "../engine/entity";

export class Label extends Entity {

  private _text: string;
  private _fontSize: number = 20;
  private _hoverFontSize: number = 20;
  private _clickFontSize: number = 20;
  private _fontColor: string = "rgba(255,255,255, 1.0)";
  private _hoverFontColor: string = "rgba(255, 255, 255, 1.0)";
  private _hoverCursor: string = "default";
  private ctx: CanvasRenderingContext2D;
  private _clickFontColor: string = "rgba(255, 255, 255, 1.0)";
  private _clicked: boolean = false;

  constructor(x: number, y: number, text: string, ctx: CanvasRenderingContext2D) {

    super(x, y, 0, 0);
    this.ctx = ctx;
    this.onMouseEvent("mousedown", this.onMouseDown.bind(this));
    this.onMouseEvent("mouseup", this.onMouseUp.bind(this));
    this.onMouseEvent("mouseenter", this.onMouseEnter.bind(this));
    this.onMouseEvent("mouseleave", this.onMouseLeave.bind(this));
    this._text = text;
  }

  private onMouseDown( event: MouseEvent) {
    this._clicked = true;
  }

  private onMouseUp(event: MouseEvent) {
    this._clicked = false;
  }

  private onMouseEnter(event: MouseEvent) {
    this.board?.changeCursor(this._hoverCursor);
  }

  private onMouseLeave(event: MouseEvent) {
      this.board?.changeCursor("default");
  }

  get clicked() {
    return this._clicked;
  }

  set clicked(clicked: boolean) {
    this._clicked = clicked;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    //text options
    var fontSize = this.fontSize;
    ctx.fillStyle = this.fontColor;
    if (this.clicked) {
      fontSize = this.clickFontSize;
      ctx.fillStyle = this.clickFontColor;
    }else if (this.hovered) {
      fontSize = this.hoverFontSize;
      ctx.fillStyle = this.hoverFontColor;
    }

    ctx.font = fontSize + "px sans-serif";

    //text position
    var textSize = ctx.measureText(this._text);
    this.width = textSize.width;
    this.height = fontSize;
    var textX = this.x;
    var textY = this.y + fontSize;

    //draw the text
    ctx.fillText(this._text, textX, textY);
  }

  get width() {
    this.ctx.font = this.fontSize + "px sans-serif";
    return this.ctx.measureText(this._text).width;
  }

  set width(width: number) {
    this._width = width;
  }

  update(): void {

  }

  /*********************
   * Getters & Setters *
   *********************/
  get text(): string { return this._text; }
  set text(value: string) { this._text = value; }
  get clickFontColor(): string { return this._clickFontColor; }
  set clickFontColor(value: string) { this._clickFontColor = value; }
  get hoverFontColor(): string { return this._hoverFontColor; }
  set hoverFontColor(value: string) { this._hoverFontColor = value; }
  get fontColor(): string { return this._fontColor; }
  set fontColor(value: string) { this._fontColor = value; }
  get fontSize(): number { return this._fontSize; }
  set fontSize(value: number) { this._fontSize = value; this._hoverFontSize = value; }
  get clickFontSize(): number { return this._clickFontSize; }
  set clickFontSize(value: number) { this._clickFontSize = value; }
  get hoverFontSize(): number { return this._hoverFontSize; }
  set hoverFontSize(value: number) { this._hoverFontSize = value; }
  get hoverCursor(): string { return this._hoverCursor; }
  set hoverCursor(value: string) { this._hoverCursor = value; }
}
