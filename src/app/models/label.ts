import {Entity} from "../engine/entity";

export class Label extends Entity {
  private text: string;

  private _fontSize: number = 20;
  private _hoverFontSize: number = 20;
  private _clickFontSize: number = 20;
  private _fontColor: string = "rgba(230,77,59, 1.0)";
  private _hoverFontColor: string = "rgba(255, 255, 255, 1.0)";
  private _clickFontColor: string = "rgba(255, 255, 255, 1.0)";
  private _clicked: boolean = false;
  private _link: string|null = null;

  constructor(x: number, y: number, text: string = "") {

    super(x, y, 0, 0);
    this.onMouseEvent("mousedown", this.onMouseDown(this));
    this.onMouseEvent("mouseup", this.onMouseUp(this));
    this.onMouseEvent("mouseenter", this.onMouseEnter(this));
    this.onMouseEvent("mouseleave", this.onMouseLeave(this));
    this.text = text;
  }

  private onMouseDown(self: Label) {
    return (event: MouseEvent) => {
      self._clicked = true;
    }
  }

  private onMouseUp(self: Label) {
    return (event: MouseEvent) => {
      self._clicked = false;
    }
  }

  private onMouseEnter(self: Label) {
    return (event: MouseEvent) => {
      if (self._link !== null) {
        self.board?.changeCursor("pointer");
      }
    }
  }

  private onMouseLeave(self: Label) {
    return (event: MouseEvent) => {
      if (self._link !== null) {
        self.board?.changeCursor("default");
      }
    }
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
    var textSize = ctx.measureText(this.text);
    this.width = textSize.width;
    this.height = fontSize;
    var textX = this.x;
    var textY = this.y;

    //draw the text
    ctx.fillText(this.text, textX, textY);
  }

  update(): void {

  }


  /*********************
   * Getters & Setters *
   *********************/
  get clickFontColor(): string { return this._clickFontColor; }
  set clickFontColor(value: string) { this._clickFontColor = value; }
  get hoverFontColor(): string { return this._hoverFontColor; }
  set hoverFontColor(value: string) { this._hoverFontColor = value; }
  get fontColor(): string { return this._fontColor; }
  set fontColor(value: string) { this._fontColor = value; }
  get fontSize(): number { return this._fontSize; }
  set fontSize(value: number) { this._fontSize = value; }
  get clickFontSize(): number { return this._clickFontSize; }
  set clickFontSize(value: number) { this._clickFontSize = value; }
  get hoverFontSize(): number { return this._hoverFontSize; }
  set hoverFontSize(value: number) { this._hoverFontSize = value; }
}
