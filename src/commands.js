// Copyright (c) 2018 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

'use strict';

const sql = require('./sql.js');

const commands = {};

commands.newGame = async function (bot, msg) {
    const games = await sql.getGames();
    console.table(games);
};

module.exports = commands;
