/**
 * Your game config
 */
export class BoardConfig {

  public game : { FPS: number } = {
    FPS: 30
  }

  public board: {
    size: {width: number, height: number}, background: string } = {
    size: {
      width: 800,
      height: 800
    },
    background: "#eee"
  };
}
