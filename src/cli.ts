import { SetupError } from "./error";
import { UI, IGame, GameResult } from "./types";
import { terminal as term } from "terminal-kit";

export class CLI implements UI {
  #game: IGame;

  constructor(game: IGame) {
    this.#game = game;
  }

  start(): void {
    try {
      this.setupAndRun();
    } catch (e) {
      if (e instanceof SetupError) {
        term.bold.brightRed(`Invalid input: ${e.message}\n`);
      } else {
        throw e;
      }
    }
  }

  private setupAndRun() {
    this.#game.setup(process.argv.slice(2));
    this.drawSeparator();
    term.bold.blue(`HMAC: ^G${this.#game.moveOrHash}`);
    this.drawSeparator();
    this.calcTable();
    this.displayControls();
  } 

  private displayControls() {
    term.bold.cyan("\nAvailable moves (arrows to select, enter to submit): \n");

    const items = this.#game.moves.map(
      (move, index) => `${index + 1}. ${move}`
    );

    const helpIndex = items.push("?. Help") - 1;
    const exitIndex = items.push("X. Exit") - 1;

    term.singleColumnMenu(items, (_, response) => {
      term("\n");
      if (response.selectedIndex === helpIndex) this.displayTable();
      else if (response.selectedIndex === exitIndex) {
        term.bold.cyan("Bye!\n");
        process.exit();
      } else this.makeMove(response.selectedIndex);
    });
  }

  private makeMove(index: number): void {
    const result = this.#game.makeMove(index);

    term.bold.green(`Your move: ${this.#game.moves[index]}\n`);
    term.bold.brightRed(`Computer's move: ${this.#game.moveOrHash}\n\n`);

    switch (result) {
      case GameResult.Draw:
        term.bold.cyan(`It's a draw\n`);
        break;
      case GameResult.Lose:
        term.bold.brightRed(`You lose!\n`);
        break;
      case GameResult.Win:
        term.bold.green(`You win!\n`);
        break;
    }

    this.drawSeparator(74);
    term.bold.blue(`HMAC key: ^G${this.#game.key ?? "(Error occured)"}`);
    this.drawSeparator(74);

    process.exit();
  }

  // TABLE
  // ===========================

  #table: string[][] = [];

  private calcTable() {
    this.#table = [['#', ...this.#game.moves], ...this.#game.moves.map(item => [item])];

    for (let j = 0; j < this.#game.moves.length; j++)
      for (let i = 0; i < this.#game.moves.length; i++) {
        const result = this.#game.whoWins(j, i);

        const tableText = result === GameResult.Draw 
          ? "^cDraw"
          : result === GameResult.Lose 
            ? "^RLose"
            : "^gWin";
        
        this.#table[j + 1].push(tableText);
      }
  }

  private displayTable() {
    this.drawSeparator();

    term.bold.cyan("Here is a win table of moves\n");
    term.bold.cyan("Columns: player's moves, Rows: computer's moves\n\n");

    term.table(
      this.#table,
      {
        hasBorder: false,
        contentHasMarkup: true,
        textAttr: { bgColor: "default" },
        firstCellTextAttr: { bgColor: "cyan"},
        firstRowTextAttr: { bgColor: "red" },
        firstColumnTextAttr: { bgColor: "blue" },
        fit: true,
        width: 50,
      }
    );

    this.drawSeparator();
    this.displayControls();
  }

  // UTILS
  // ==========================

  private drawSeparator(length = 64 + 6) {
    term("\n" + "=".repeat(length) + "\n");
  }
}
