import { compareSync, hashSync, genSaltSync } from 'bcrypt';

const saltRounds = 10;

const salt = genSaltSync(saltRounds);

export const generateHash = (password: string): string  => {
  return hashSync(password, salt);
}

export const compareHash = (password: string, hash: string): boolean => {
  return compareSync(password, hash);
}


export const crypt = { generateHash, compareHash }
/*
require('dotenv').config();
import crypto from 'crypto';

const KEY_CRYPTO = {
  alg: 'aes256',
  key: String(process.env.API_SECRET_KEY),
  type: 'hex',
};

const genHash = (password: string): string => {
  const cipher = crypto.createCipher(KEY_CRYPTO.alg, KEY_CRYPTO.key);
  cipher.update(password)
  return cipher.final(KEY_CRYPTO.type)
}

const compHash = (password: string) => {
  const decipher = crypto.createDecipher(KEY_CRYPTO.alg, KEY_CRYPTO.key);
  decipher.update(password, KEY_CRYPTO.type);
  return decipher.final();
}
*/