import { createHmac, randomBytes } from "crypto";
import type { IHmacManager } from "./types";
import { Buffer } from "node:buffer";

const DEFAULT_ALG = "sha256";

export class HMACManager implements IHmacManager {
  private _key: Buffer = Buffer.from("");

  get key() {
    return this._key.toString('hex');
  }

  createHmac(message: string): string {
    this._key = randomBytes(32);
    return createHmac(DEFAULT_ALG, this._key).update(message).digest().toString('hex');
  }
}
