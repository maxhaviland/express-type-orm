require('dotenv').config();
module.exports = {
  "type": process.env.DB_TYPE,
  "host": process.env.DB_HOST,
  "port": process.env.DB_PORT,
  "username": process.env.DB_USER,
  "password": process.env.DB_PASS,
  "database": process.env.DB_NAME,
  "entities": ["dist/app/entity/**/*.js"],
  "logging": false,
  "synchronize": true
}

