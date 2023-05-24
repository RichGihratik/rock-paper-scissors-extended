import { SetupError } from "./error";
import { IGame, GameResult } from "./types";
import { terminal as term } from "terminal-kit";
import { clearScreenDown, cursorTo } from "node:readline";
import { stdout } from "node:process";

export class CLI {
  #game: IGame;

  constructor(game: IGame) {
    this.#game = game;
  }

  start(): void {
    try {
      this.setupAndRun();
    } catch (e) {
      if (e instanceof SetupError) {
        term.brightRed(`Invalid arguments: ${e.message}`);

        term.cyan(`\nExample of correct args: "node dist Rock Scissors Paper"`)
        term.processExit(0);
      } else {
        throw e;
      }
    }
  }

  private setupAndRun() {
    this.#game.setup(process.argv.slice(2));
    this.calcTable();
    this.displayControls();
  } 

  private displayControls() {
    this.clearDisplay();
    this.displayHMAC();

    term.bold.cyan("\nAvailable moves (arrows to select, enter to submit): \n");

    const items = this.#game.moves.map(
      (move, index) => `${index + 1}. ${move} `
    );

    const helpIndex = items.push("?. Help ") - 1;
    const exitIndex = items.push("X. Exit ") - 1;

    term.singleColumnMenu(items, (_, response) => {
      term("\n");
      if (response.selectedIndex === helpIndex) this.displayTable();
      else if (response.selectedIndex === exitIndex) {
        term.bold.cyan("Bye!\n");
        term.processExit(0);
      } else this.makeMove(response.selectedIndex);
    });
  }

  private makeMove(index: number): void {
    this.clearDisplay();
    const result = this.#game.makeMove(index);

    term.green(`Your move: ${this.#game.moves[index]}\n`);
    term.brightRed(`Computer's move: ${this.#game.moveOrHash}\n\n`);

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
    term.bold.blue(`HMAC key: `);
    term.brightGreen(`${this.#game.key ?? "(Error occured)"}`);
    this.drawSeparator(74);

    term.processExit(0);
  }

  // TABLE
  // ===========================

  #table: string[][] = [];

  private calcTable() {
    this.#table = [['#', ...this.#game.moves], ...this.#game.moves.map(item => [item])];

    for (let j = 0; j < this.#game.moves.length; j++)
      for (let i = 0; i < this.#game.moves.length; i++) {
        const result = this.#game.getGameResult(j, i);

        const tableText = result === GameResult.Draw 
          ? "^cDraw"
          : result === GameResult.Lose 
            ? "^RLose"
            : "^gWin";
        
        this.#table[j + 1].push(tableText);
      }
  }

  private displayTable() {
    this.clearDisplay();

    term.bold.cyan("RULES: \n")

    term.cyan(`Computer randomly have already made a move\n`);
    term.cyan(`Your task is try to guess and beat it with your move.\n`);
    term.cyan(`Using key (will be shown after your move) and HMAC (SHA3-256), you can check whether computer played fair\n`);
    term.cyan("Here is a win table of moves:\n");
    term.cyan("(columns - player's moves, rows - computer's moves)\n\n");

    term.table(
      this.#table,
      {
        hasBorder: false,
        contentHasMarkup: true,
        textAttr: { bgColor: "default" },
        firstCellTextAttr: { bgColor: "cyan"},
        firstRowTextAttr: { bgColor: "red" },
        firstColumnTextAttr: { bgColor: "brightGreen" },
        fit: true,
        width: 50,
      }
    );
    
    term.blue('\nPress ENTER to continue...');

    term.inputField({ echo: false }, () => {
      term('\n');
      this.displayControls();
    })
  }

  // UTILS
  // ==========================

  private drawSeparator(length = 64 + 6) {
    term("\n" + "=".repeat(length) + "\n");
  }

  private displayHMAC() {
    this.drawSeparator();
    term.bold.blue(`HMAC: `);
    term.brightGreen(`${this.#game.moveOrHash}`);
    this.drawSeparator();
  }

  private clearDisplay() {
    const repeatCount = stdout.rows - 2
    const blank = repeatCount > 0 ? '\n'.repeat(repeatCount) : ''
    console.log(blank)
    cursorTo(stdout, 0, 0);
    clearScreenDown(stdout);
  }
}
