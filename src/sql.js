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

const sql = {},
    dateFormat = 'yyyy-LL-dd HH:mm';

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

sql.getUser = async function (id) {
    const query = sqlstring.format(
        'SELECT * FROM users WHERE id=?;', [id]);
    return sql.runQuery(query);
};

sql.getGame = async function (id) {
    const query = sqlstring.format(
        'SELECT * FROM games WHERE id=?;', [id]);
    return sql.runQuery(query);
};

sql.getGames = async function (includePast) {
    const query = ['SELECT * FROM games'];

    if (!includePast) {
        query.push('WHERE date >= NOW()');
    }
    query.push('ORDER BY date;');
    return sql.runQuery(query.join(' '));
};

sql.getGamesAsPlayer = async function (userId) {
    const query = sqlstring.format(
        'SELECT g.* FROM games AS g INNER JOIN players AS p ON g.id = p.game WHERE g.date >= NOW() AND p.player = ? ORDER BY g.date;', [
            userId
        ]
    );
    return sql.runQuery(query);
};

sql.getGamesNotJoined = async function (userId) {
    const query = sqlstring.format(
        'SELECT * FROM games WHERE date >= NOW() AND id NOT IN (SELECT game FROM players WHERE player = ?);', [
            userId
        ]
    );
    return sql.runQuery(query);
};

sql.getGamesAsOrganizer = async function (userId) {
    const query = sqlstring.format(
        'SELECT * FROM games WHERE date >= NOW() AND organizer ?;', [userId]);
    return sql.runQuery(query);
};

sql.getPlayers = async function (game) {
    const query = sqlstring.format(
        'SELECT u.first_name, u.last_name, p.game FROM users AS u INNER JOIN players AS p ON u.id = p.player WHERE p.game = ?;', [
            game
        ]
    );
    return sql.runQuery(query);
};

sql.getNumberOfPlayers = async function (game) {
    const query = sqlstring.format(
        'SELECT COUNT(id) FROM players WHERE game = ?;', [game]);
    return sql.runQuery(query);
};

sql.createUser = async function (id, first, last, username) {
    const query = sqlstring.format(
        'INSERT INTO users (id, first_name, last_name, username) VALUES (?, ?, ?, ?);', [
            id, first, last, username
        ]
    );
    return sql.runQuery(query);
};

sql.createGame = async function (organizer, capacity, datetime, game) {
    let query, gameId;

    query = sqlstring.format(
        'INSERT INTO games (organizer, capacity, date, game) VALUES (?, ?, ?, ?);', [
            organizer, capacity, datetime.toFormat(dateFormat), game
        ]
    );
    await sql.runQuery(query);

    query = sqlstring.format(
        'SELECT id FROM games WHERE organizer=? ORDER BY created DESC LIMIT 1;', [
            organizer
        ]
    );
    gameId = await sql.runQuery(query);
    gameId = gameId[0].id;

    query = sqlstring.format(
        'INSERT INTO players (game, player) VALUES (?, ?);', [
            gameId, organizer
        ]
    );
    return sql.runQuery(query);
};

sql.deleteGame = async function (game) {
    const query = sqlstring.format(
        'DELETE FROM games WHERE game = ?;', [game]);
    return sql.runQuery(query);
};

sql.addPlayer = async function (game, user) {
    const query = sqlstring.format(
        'INSERT INTO players (game, player) VALUES (?, ?);', [game, user]);
    return sql.runQuery(query);
};

sql.deletePlayer = async function (game, user) {
    const query = sqlstring.format(
        'DELETE FROM players WHERE game = ? AND player = ?;', [game, user]);
    return sql.runQuery(query);
};

module.exports = sql;
