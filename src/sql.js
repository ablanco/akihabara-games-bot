// Copyright (c) 2018 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

'use strict';

const mariadb = require('mariadb'),
    settings = require('./settings.js'),
    sqlstring = require('sqlstring');

const pool = mariadb.createPool({
    host: settings.database.host,
    user: settings.database.user,
    password: settings.database.password,
    database: settings.database.database,
    connectionLimit: settings.database.connectionLimit
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
        query.push('WHERE date >= NOW()');
    }
    query.push(';');
    return sql.runQuery(query.join(' '));
};

sql.createUser = async function (first, last, username) {
    const query = sqlstring.format('INSERT INTO users VALUES (null, ?, ?, ?);', [
        first, last, username
    ]);
    return sql.runQuery(query);
};

sql.createGame = async function (organizer, capacity, day, time, game) {
    const query = sqlstring.format('INSERT INTO games VALUES (null, ?, ?, ?, ?);', [
        organizer, capacity, `${day} ${time}`, game
    ]);
    return sql.runQuery(query);
};

module.exports = sql;
