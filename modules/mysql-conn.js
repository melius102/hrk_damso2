const mysql = require('mysql2/promise');
const { host, user, password, database } = require('./private_keys');

const pool = mysql.createPool({
    host,
    user,
    password,
    port: 3306,
    database,
    connectionLimit: 10
});

const sqlErr = (err) => {
    console.error(err);
};

module.exports = { pool, sqlErr };