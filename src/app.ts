import { CLI } from "./cli";
import { Game } from "./game";
import { HMACManager } from "./hmac";

export class App {
  #hmac = new HMACManager();
  #game = new Game(this.#hmac);
  #ui = new CLI(this.#game);

  run() {
    this.#ui.start();
  }
}
