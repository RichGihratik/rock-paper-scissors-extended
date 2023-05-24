import { createHmac, randomBytes } from "crypto";
import type { IHmacManager } from "./types";
import { Buffer } from "node:buffer";

const DEFAULT_ALG = "SHA3-256";

export class HMACManager implements IHmacManager {
  #key = Buffer.from("");
  #hash = "";

  get key() {
    return this.#key.toString('hex');
  }

  get hash() {
    return this.#hash;
  }

  createHmac(message: string): string {
    this.#key = randomBytes(32);
    this.#hash = createHmac(DEFAULT_ALG, this.#key).update(message).digest().toString('hex')
    return this.#hash;
  }
}
