// Temporary debug script — prints cwd and DB_USER after loading dotenv
const path = require('path');
const dotenvPath = path.join(__dirname, '.env');
require('dotenv').config({ path: dotenvPath, override: true });
console.log('DOTENV PATH:' + dotenvPath);
console.log('CWD:' + process.cwd());
console.log('DB_USER:' + (process.env.DB_USER || '<unset>'));
