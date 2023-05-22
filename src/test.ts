import { createHash } from 'node:crypto';

const alg = 'SHA3-256';

let copy = createHash(alg);


export class Test {
  testIt(): string {
    return copy.copy().update("Hello world!").digest('hex');
  }
}