
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import { Keypair } from '@solana/web3.js';

const mnemonic = 'idea arctic segment talk burger upon keep curve panther gate loop present';

const path = `m/44'/501'/0'/0'`;

(async () => {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const derived = derivePath(path, seed.toString('hex'));
  const keypair = Keypair.fromSeed(derived.key);
  
  console.log('Public Key:', keypair.publicKey.toBase58());
})();
