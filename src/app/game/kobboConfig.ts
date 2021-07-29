import {CookieService} from "ngx-cookie";

export class KobboConfig {

  public static cookieService: CookieService;

  public static cards: { size: {width: number, height: number} } = {
    size: {
      width: 103*0.90,
      height: 140*0.90
    }
  }
  public static GAME_RULES: { MIN_VALUE_TO_WIN: number } = {
    MIN_VALUE_TO_WIN : 5
  }

  public static setLightBackground() {
    (document.getElementsByClassName("game-container").item(0) as HTMLElement).style.background = "#075B15";
  }

  public static setDarkBackground() {
    (document.getElementsByClassName("game-container").item(0) as HTMLElement).style.background = "#042D0B";
  }
}
