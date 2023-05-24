export interface IHmacManager {
  readonly key: string;
  readonly hash: string;
  createHmac(message: string): string;
}

export enum GameResult {
  Win = "win",
  Lose = "lose",
  Draw = "draw"
}

export interface IGame {
  readonly moveOrHash: string;
  readonly key: string | undefined;
  readonly moves: string[];
  readonly gameStarted: boolean;
  setup(moves: string[]): void;
  makeMove(moveIndex: number): GameResult;
  getGameResult(yourMove: number, opponentsMove: number): GameResult;
}