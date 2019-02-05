// Copyright (c) 2019 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

/*global Promise*/

'use strict';

const sql = require('./sql.js'),
    { DateTime } = require('luxon'),
    _ = require('lodash');

const utils = {};

utils.getOrCreateUser = async function (msg) {
    let user = await sql.getUser(msg.from.id);
    if (user.length === 0) {
        await sql.createUser(
            msg.from.id,
            msg.from.first_name,
            msg.from.last_name || '',
            msg.from.username || ''
        );
        user = await sql.getUser(msg.from.id);
    }
    user = user[0];
    return user;
};

utils.getPlayersFromGames = async function (games) {
    let players = _.map(games, function (game) {
        return sql.getPlayers(game.id);
    });
    players = await Promise.all(players);
    return players;
};

utils.renderGames = async function (games) {
    const players = await utils.getPlayersFromGames(games);

    return _.map(games, function (game, i) {
        const date = DateTime.fromJSDate(game.date).setLocale('es');
        let gamers;

        gamers = _.map(players[i], function (user) {
            return `- ${user.first_name} ${user.last_name}`;
        });
        _.times(game.capacity - gamers.length, function () {
            gamers.push('- ?');
        });
        gamers = gamers.join('\n');

        return `${_.upperCase(game.game)}
Fecha: ${date.toLocaleString(DateTime.DATETIME_MED)}
Plazas: ${game.capacity}
Apuntados:
${gamers}`;
    });
};

module.exports = utils;
