const assert = require('assert');
const sinon = require('sinon');
const prompt = require('prompt');
const bcrypt = require('bcrypt');
const { getHash } = require('./passwordHasher');

describe('Password Hasher', function () {
  it('повертає хеш при однакових паролях', async function () {
    const promptStub = sinon.stub(prompt, 'get');
    promptStub.resolves({ password
