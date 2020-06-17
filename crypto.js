var fs = require('fs')
const util = require('util');
const SimpleCrypto = require("simple-crypto-js").default

const readFile = util.promisify(fs.readFile);

const enc = (input, k) => {
  readFile(".super-secret-file.k", 'utf8').then( (data) => k.send(encryptWithKey(data,input)));
}

const dec = (input, k) => {
  readFile(".super-secret-file.k", 'utf8').then( (data) => k.send(decryptWithKey(data,input)));
}

const encSync = (input) => {
  const key = fs.readFileSync(".super-secret-file.k", 'utf8');
  return encryptWithKey(key, input);
}

const decSync = (input) => {
  const key = fs.readFileSync(".super-secret-file.k", 'utf8');
  return decryptWithKey(key, input);
}

const encryptWithKey = (key, plain) => {
  const simpleCrypto = new SimpleCrypto(key);
  const c = simpleCrypto.encrypt(plain);
  return c;
}

const decryptWithKey = (key, cipher) => {
  const simpleCrypto = new SimpleCrypto(key);
  const m = simpleCrypto.decrypt(cipher);
  return m;
}

exports.decSync = decSync
exports.encSync = encSync
exports.enc = enc
exports.dec = dec
