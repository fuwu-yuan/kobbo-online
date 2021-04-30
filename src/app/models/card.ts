
export class Card {

  private _value;
  private _power;
  private _image: HTMLImageElement;
  private _name: any;
  private _color: string;

  constructor(
    name: string,
    color: string) {

    this._name = name;
    this._color = color;
    this._value = this.getValue();
    this._power = (this.color+this.name) in this.getPowerMap() ? this.getPowerMap()[this.color+this.name] : null;
    this._image = this.loadImage();
  }

  get value() {
    return this._value;
  }

  get power() {
    return this._power;
  }

  get image() {
    return this._image;
  }

  get name(): string {
    return this._name;
  }

  get color(): string {
    return this._color;
  }

  getPowerMap() {
    const powerMapping: any = {};
    // 7 = watch self
    powerMapping[Colors.CLUBS+Names.$7] = Powers.WATCH_SELF;
    powerMapping[Colors.DIAMONDS+Names.$7] = Powers.WATCH_SELF;
    powerMapping[Colors.HEARTS+Names.$7] = Powers.WATCH_SELF;
    powerMapping[Colors.SPADES+Names.$7] = Powers.WATCH_SELF;
    // 8 = watch self
    powerMapping[Colors.CLUBS+Names.$8] = Powers.WATCH_SELF;
    powerMapping[Colors.DIAMONDS+Names.$8] = Powers.WATCH_SELF;
    powerMapping[Colors.HEARTS+Names.$8] = Powers.WATCH_SELF;
    powerMapping[Colors.SPADES+Names.$8] = Powers.WATCH_SELF;
    // 9 = watch other
    powerMapping[Colors.CLUBS+Names.$9] = Powers.WATCH_OTHER;
    powerMapping[Colors.DIAMONDS+Names.$9] = Powers.WATCH_OTHER;
    powerMapping[Colors.HEARTS+Names.$9] = Powers.WATCH_OTHER;
    powerMapping[Colors.SPADES+Names.$9] = Powers.WATCH_OTHER;
    // 10 = watch other
    powerMapping[Colors.CLUBS+Names.$10] = Powers.WATCH_OTHER;
    powerMapping[Colors.DIAMONDS+Names.$10] = Powers.WATCH_OTHER;
    powerMapping[Colors.HEARTS+Names.$10] = Powers.WATCH_OTHER;
    powerMapping[Colors.SPADES+Names.$10] = Powers.WATCH_OTHER;
    // J = blind switch
    powerMapping[Colors.CLUBS+Names.$JACK] = Powers.BLIND_SWITCH;
    powerMapping[Colors.DIAMONDS+Names.$JACK] = Powers.BLIND_SWITCH;
    powerMapping[Colors.HEARTS+Names.$JACK] = Powers.BLIND_SWITCH;
    powerMapping[Colors.SPADES+Names.$JACK] = Powers.BLIND_SWITCH;
    // Q = blind switch
    powerMapping[Colors.CLUBS+Names.$QUEEN] = Powers.BLIND_SWITCH;
    powerMapping[Colors.DIAMONDS+Names.$QUEEN] = Powers.BLIND_SWITCH;
    powerMapping[Colors.HEARTS+Names.$QUEEN] = Powers.BLIND_SWITCH;
    powerMapping[Colors.SPADES+Names.$QUEEN] = Powers.BLIND_SWITCH;
    // K red = watch other and switch (or not)
    powerMapping[Colors.HEARTS+Names.$KING] = Powers.KING_SWITCH;
    powerMapping[Colors.SPADES+Names.$KING] = Powers.KING_SWITCH;

    return powerMapping;
  }

  getValue() {
    if (this.name === Names.$KING && this.isBlack()) {
      return 0;
    }
    // @ts-ignore
    return Values[this._name];// FUCK
  }

  isBlack() {
    return this.color === Colors.CLUBS || this.color === Colors.SPADES;
  }

  isRed() {
    return !this.isBlack();
  }

  loadImage()
  {
    let image = new Image();
    image.src = "./assets/images/cards/card"+(this.color[0].toUpperCase() + this.color.slice(1))+this.name+".png";

    return image;
  }
}

export let Colors = {
    CLUBS : 'clubs',
    DIAMONDS : 'diamonds',
    HEARTS : 'hearts',
    SPADES : 'spades'
}

export let Names = {
  $ACE : "A",
  $2 : "2",
  $3 : "3",
  $4 : "4",
  $5 : "5",
  $6 : "6",
  $7 : "7",
  $8 : "8",
  $9 : "9",
  $10 : "10",
  $JACK : "J",
  $QUEEN : "Q",
  $KING : "K"
}

export let Values = {
  "ACE": 1,
  "2" : 2,
  "3" : 3,
  "4" : 4,
  "5" : 5,
  "6" : 6,
  "7" : 7,
  "8" : 8,
  "9" : 9,
  "10" : 10,
  "JACK" : 11,
  "QUEEN" : 12,
  "KING" : 15
}

export let Powers = {
  WATCH_SELF : "watch_self",
  WATCH_OTHER : "watch_other",
  BLIND_SWITCH : "blind_switch",
  KING_SWITCH : "king_switch"
}
