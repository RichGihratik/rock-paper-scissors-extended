import { type IHmacManager, type IGame, GameResult } from "./types";
import { SetupError } from "./error";

export class Game implements IGame {
  #move: number = -1;
  #manager: IHmacManager;
  #moves: string[] = [];

  constructor(manager: IHmacManager) {
    this.#manager = manager;
  }

  #gameStarted = false;

  get gameStarted() {
    return this.#gameStarted;
  }

  get moves() {
    return [...this.#moves];
  }

  get moveOrHash() {
    return this.#gameStarted ? this.#manager.hash : this.#moves[this.#move];
  }

  get key() {
    return this.#gameStarted ? undefined : this.#manager.key;
  }

  setup(moves: string[]): void {
    if (moves.some((move) => moves.indexOf(move) !== moves.lastIndexOf(move)))
      throw new SetupError("Some elements occur more than once in list!");
    if (moves.length < 3)
      throw new SetupError("Item's count must be more than 3!");
    if (moves.length % 2 !== 1)
      throw new SetupError("Item's count must be odd!");

    this.#moves = [...moves];
    this.#move = Math.floor(Math.random() * moves.length);

    this.#manager.createHmac(this.#moves[this.#move]);

    this.#gameStarted = true;
  }

  makeMove(moveIndex: number): GameResult {
    if (moveIndex < 0 || moveIndex >= this.#moves.length)
      throw new TypeError("Invalid number!");

    this.#gameStarted = false;

    return this.getGameResult(moveIndex, this.#move);
  }

  getGameResult(yourMove: number, opponentsMove: number): GameResult {
    if (
      yourMove < 0 ||
      yourMove >= this.#moves.length ||
      opponentsMove < 0 ||
      opponentsMove >= this.#moves.length
    )
      throw new TypeError("Invalid numbers!");

    if (yourMove === opponentsMove) return GameResult.Draw;

    const diff = yourMove - opponentsMove;
    const positiveDir = diff < 0 ? this.#moves.length + diff : diff;

    const lengthToWin = (this.#moves.length - 1) / 2;

    return lengthToWin >= positiveDir ? GameResult.Lose : GameResult.Win;
  }
}
