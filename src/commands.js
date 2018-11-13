// Copyright (c) 2018 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

'use strict';

const sql = require('./sql.js');

const commands = {};

commands.newGame = async function (bot, msg) {
    const games = await sql.getGames();
    let user = await sql.getUser(msg.from.id);

    if (user.length === 0) {
        await sql.createUser(
            msg.from.id,
            msg.from.first_name,
            msg.from.last_name,
            msg.from.username
        );
        user = await sql.getUser(msg.from.id);
    }
    user = user[0];

    bot.sendMessage(user.id, user.username);

    console.table(games);
};

commands.processCallback = async function (bot, msg) {
    console.log(msg);
};

module.exports = commands;
