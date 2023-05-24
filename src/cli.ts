import { GameError } from "./error";
import { UI, IGame, GameResult } from "./types";
import { terminal as term } from "terminal-kit";

export class CLI implements UI {
  #game: IGame;

  constructor(game: IGame) {
    this.#game = game;
  }

  private setupAndRun() {
    this.#game.setup(process.argv.slice(2));
    this.drawSeparator();
    term.bold.blue(`HMAC: ^G${this.#game.moveOrHash}`);
    this.drawSeparator();
    this.displayControls();
  }

  private drawSeparator(length = 64 + 6) {
    term('\n' + '='.repeat(length) + '\n');
  }

  private makeMove(index: number): void {
    const result = this.#game.makeMove(index);

    term.bold.brightGreen(`Your move: ${this.#game.moves[index]}\n`);
    term.bold.blue(`Computer's move: ${this.#game.moveOrHash}\n\n`);

    switch(result) {
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
    term.bold.blue(`HMAC key: ^G${this.#game.key ?? '(Error occured)'}`);
    this.drawSeparator(74);

    process.exit();
  }

  private displayControls() {
    term.bold.cyan("\nAvailable moves (arrows to select, enter to submit): \n");

    const items = this.#game.moves.map((move, index) => `${index + 1}. ${move}`);

    const helpIndex = items.push("?. Help") - 1;
    const exitIndex = items.push("X. Exit") - 1;

    term.singleColumnMenu(items, (_, response) => {
      term('\n');
      if (response.selectedIndex === helpIndex)
        this.displayTable();    
      else if (response.selectedIndex === exitIndex) {
        term.bold.cyan('Bye!\n'); 
        process.exit();
      } else this.makeMove(response.selectedIndex);
    });
  }

  private displayTable() {
    this.drawSeparator();

    term.bold.red("Work in progress...")

    this.drawSeparator();
    this.displayControls();
  }

  start(): void {
    try {
      this.setupAndRun();
    } catch (e) {
      if (e instanceof GameError) {
        term.bold.brightRed(`Invalid input: ${e.message}\n`);
      } else {
        throw e;
      }
    }
  }
}
