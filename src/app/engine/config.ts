/**
 * Your game config
 */
//TODO déplacer la config spécifique au KOBBO dans une classe perso
export class Config {

  public game : { FPS: number } = {
    FPS: 30
  }

  public board: { size: {width: number, height: number} } = {
    size: {
      width: 800,
      height: 800
    }
  };
  public cards: { size: {width: number, height: number} } = {
    size: {
      width: 140,
      height: 190
    }
  }

  public nbPlayers: number = 4;

}
