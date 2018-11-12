// Copyright (c) 2018 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

'use strict';

const mariadb = require('mariadb'),
    settings = require('./settings.js'),
    sqlstring = require('sqlstring');

const pool = mariadb.createPool({
    host: settings.db.host,
    user: settings.db.user,
    password: settings.db.password,
    connectionLimit: settings.db.connectionLimit
});

const sql = {};

sql.runQuery = async function (query) {
    let conn;

    try {
        conn = await pool.getConnection();
        return conn.query(query);
    } catch (err) {
        throw err;
    } finally {
        if (conn) { conn.end(); }
    }
};

sql.getGames = async function (includePast) {
    const query = ['SELECT * FROM games'];

    if (!includePast) {
        query.push('WHERE blabla'); // TODO
    }
    query.push(';');
    return sql.runQuery(query.join(' '));
};

sql.createGame = async function (game, creator, capacity, date) {
    const query = sqlstring.format('INSERT INTO games VALUES (?, ?, ?, ?);', [
        game, creator, capacity, date
    ]);
    return sql.runQuery(query);
};

module.exports = sql;
