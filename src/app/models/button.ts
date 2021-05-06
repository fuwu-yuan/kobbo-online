import {Entity} from "../engine/entity";

export class Button extends Entity {
  private text: string;

  private _strokeColor: string = "rgba(230,77,59, 1.0)";
  private _fillColor: string = "rgba(0, 0, 0, 0.0)";
  private _hoverStrokeColor: string = "rgba(230,77,59, 1.0)";
  private _hoverFillColor: string = "rgba(230,77,59, 1.0)";
  private _clickStrokeColor: string = "rgba(230,97,79, 1.0)"
  private _clickFillColor: string = "rgba(230,97,79, 1.0)"
  private _fontSize: number = 20;
  private _hoverFontSize: number = 20;
  private _clickFontSize: number = 20;
  private _fontColor: string = "rgba(230,77,59, 1.0)";
  private _hoverFontColor: string = "rgba(255, 255, 255, 1.0)";
  private _clickFontColor: string = "rgba(255, 255, 255, 1.0)";
  private _radius : {tl: number, tr: number, br: number, bl: number} = {tl: 10, tr: 10, br: 10, bl: 10};
  private _clicked: boolean = false;

  constructor(x: number, y: number, width: number, height: number, text: string = "") {
    super(x, y, width, height);
    this.onMouseEvent("mousedown", this.onMouseDown(this));
    this.onMouseEvent("mouseup", this.onMouseUp(this));
    this.onMouseEvent("mouseenter", this.onMouseEnter(this));
    this.onMouseEvent("mouseleave", this.onMouseLeave(this));
    this.text = text;
  }

  private onMouseDown(self: Button) {
    return (event: MouseEvent) => {
      self._clicked = true;
    }
  }

  private onMouseUp(self: Button) {
    return (event: MouseEvent) => {
      self._clicked = false;
    }
  }

  private onMouseEnter(self: Button) {
    return (event: MouseEvent) => {
      self.board?.changeCursor("pointer");
    }
  }

  private onMouseLeave(self: Button) {
    return (event: MouseEvent) => {
      self.board?.changeCursor("default");
    }
  }

  get clicked() {
    return this._clicked;
  }

  set clicked(clicked: boolean) {
    this._clicked = clicked;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    //set color
    ctx.strokeStyle = this.strokeColor;
    ctx.fillStyle = this.fillColor;
    if (this.clicked) {
      ctx.strokeStyle = this.clickStrokeColor;
      ctx.fillStyle = this.clickFillColor;
    }else if (this.hovered) {
      ctx.strokeStyle = ctx.fillStyle = this.hoverStrokeColor;
      ctx.fillStyle = ctx.fillStyle = this.hoverFillColor;
    }

    //draw button
    ctx.beginPath();
    ctx.moveTo(this.x + this.radius.tl, this.y);
    ctx.lineTo(this.x + this.width - this.radius.tr, this.y);
    ctx.quadraticCurveTo(this.x + this.width, this.y, this.x + this.width, this.y + this.radius.tr);
    ctx.lineTo(this.x + this.width, this.y + this.height - this.radius.br);
    ctx.quadraticCurveTo(this.x + this.width, this.y + this.height, this.x + this.width - this.radius.br, this.y + this.height);
    ctx.lineTo(this.x + this.radius.bl, this.y + this.height);
    ctx.quadraticCurveTo(this.x, this.y + this.height, this.x, this.y + this.height - this.radius.bl);
    ctx.lineTo(this.x, this.y + this.radius.tl);
    ctx.quadraticCurveTo(this.x, this.y, this.x + this.radius.tl, this.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    //ctx.strokeRect(this.x, this.y, this.width, this.height);
    //ctx.fillRect(this.x, this.y, this.width, this.height);

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
    var textX = this.x + (this.width/2) - (textSize.width / 2);
    var textY = this.y + fontSize + (this.height/2) - (fontSize/2);

    //draw the text
    ctx.fillText(this.text, textX, textY);
  }

  update(): void {

  }


  /*********************
   * Getters & Setters *
   *********************/
  get hoverFillColor(): string { return this._hoverFillColor; }
  set hoverFillColor(value: string) { this._hoverFillColor = value; }
  get hoverStrokeColor(): string { return this._hoverStrokeColor; }
  set hoverStrokeColor(value: string) { this._hoverStrokeColor = value; }
  get fillColor(): string { return this._fillColor; }
  set fillColor(value: string) { this._fillColor = value; }
  get strokeColor(): string { return this._strokeColor; }
  set strokeColor(value: string) { this._strokeColor = value; }
  get clickFillColor(): string { return this._clickFillColor; }
  set clickFillColor(value: string) { this._clickFillColor = value; }
  get clickStrokeColor(): string { return this._clickStrokeColor; }
  set clickStrokeColor(value: string) { this._clickStrokeColor = value; }
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
  get radius(): { tl: number; tr: number; br: number; bl: number } { return this._radius; }
  set radius(value: { tl: number; tr: number; br: number; bl: number }) { this._radius = value; }
}
