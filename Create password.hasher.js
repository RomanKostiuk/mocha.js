const prompt = require('prompt');
const bcrypt = require('bcrypt');

async function getHash() {
  prompt.start();

  const { password, confirmPassword } = await prompt.get(['password', 'confirmPassword']);

  if (password !== confirmPassword) {
    console.log('Паролі не співпадають!');
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  console.log('Хеш пароля:', hash);

  return hash;
}

if (require.main === module) getHash();

module.exports = { getHash };
