const pool = require('../database/db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Check if a string is already bcrypt-hashed
function isBcryptHash(str) {
  return typeof str === 'string' && str.startsWith('$2b$');
}

async function hashAllPasswords() {
  try {
    const { rows: users } = await pool.query('SELECT id, password FROM users');

    for (let user of users) {
      const { id, password } = user;

      if (!isBcryptHash(password)) {
        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, id]);
        console.log(`🔐 Hashed password for user ID ${id}`);
      } else {
        console.log(`Password already hashed for user ID ${id}`);
      }
    }

    console.log('Finished hashing all passwords!');
    process.exit();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

hashAllPasswords();
