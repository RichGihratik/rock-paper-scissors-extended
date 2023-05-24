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
      throw new SetupError("Some elements occur twice in list!");
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

    return this.whoWins(moveIndex, this.#move);
  }

  whoWins(move1: number, move2: number): GameResult {
    if (
      move1 < 0 ||
      move1 >= this.#moves.length ||
      move2 < 0 ||
      move2 >= this.#moves.length
    )
      throw new TypeError("Invalid numbers!");

    if (move1 === move2) return GameResult.Draw;

    const diff = move1 - move2;
    const positiveDir = diff < 0 ? this.#moves.length + diff : diff;

    const lengthToWin = (this.#moves.length - 1) / 2;

    return lengthToWin >= positiveDir ? GameResult.Lose : GameResult.Win;
  }
}
