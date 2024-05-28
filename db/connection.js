const { Pool } = require('pg');
const ENV = process.env.NODE_ENV || 'development';

// require('dotenv').config({
//   path: `${__dirname}/../.env.${ENV}`,
// });

const pathToEnvFile = `${__dirname}/../.env.${ENV}`

require('dotenv').config({path: pathToEnvFile})

const PGDATABASE = process.env.PGDATABASE;

console.log(`the node environment is... ${ENV}`)
console.log(`the path is... ${pathToEnvFile}`)
console.log(`the database is... ${PGDATABASE}`)

if (!process.env.PGDATABASE) {
  throw new Error('PGDATABASE not set');
}

module.exports = new Pool();
