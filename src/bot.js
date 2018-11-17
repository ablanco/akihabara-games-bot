// Copyright (c) 2018 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

'use strict';

const settings = require('./settings.js'),
    commands = require('./commands.js'),
    TelegramBot = require('node-telegram-bot-api'),
    _ = require('lodash');

// TELEGRAM BOT ///////////////////////////////////////////////////////////////

const bot = new TelegramBot(settings.token, {polling: true});

// COMMANDS ///////////////////////////////////////////////////////////////////

const helpText = `Este bot permite organizar partidas de juegos de mesa

Comandos:
/ayuda - Describe el uso del bot
/nueva - Crear una partida
/lista - Listar todas las partidas (futuras)
/milista - Listar las partidas (futuras) a las que te has apuntado
/apuntarse - Apuntarse como jugador en una de las partidas
/retirarse - Retirarse como jugador de una partida en la que estabas apuntado
/cancelar - Cancela una partida que hayas organizado
`;

bot.onText(/\/start.*/, function (msg) {
    console.log(`${msg.from.id} -> start`);
    bot.sendMessage(msg.from.id, helpText);
});

bot.onText(/\/ayuda.*/, function (msg) {
    console.log(`${msg.from.id} -> ayuda`);
    bot.sendMessage(msg.from.id, helpText);
});

bot.onText(/\/nueva.*/, function (msg) {
    console.log(`${msg.from.id} -> nueva`);
    commands.newGameStart(bot, msg);
});

bot.onText(/\/lista.*/, function (msg) {
    console.log(`${msg.from.id} -> lista`);
    commands.listGames(bot, msg);
});

bot.onText(/\/milista.*/, function (msg) {
    console.log(`${msg.from.id} -> milista`);
    commands.listGames(bot, msg, true);
});

bot.onText(/\/apuntarse.*/, function (msg) {
    console.log(`${msg.from.id} -> apuntarse`);
    commands.joinGameStart(bot, msg);
});

bot.onText(/\/retirarse.*/, function (msg) {
    console.log(`${msg.from.id} -> retirarse`);
    commands.leaveGameStart(bot, msg);
});

bot.onText(/\/cancelar.*/, function (msg) {
    console.log(`${msg.from.id} -> cancelar`);
    commands.deleteGameStart(bot, msg);
});

bot.onText(/.*/, function (msg) {
    const code = _.get(msg, 'reply_to_message.text');

    if (!_.isUndefined(code)) {
        if (code[0] === 'n') {
            commands.newGameEnd(bot, msg);
        }
    }
});

bot.on('callback_query', function (msg) {
    commands.processCallback(bot, msg);
});

// INLINE MODE ////////////////////////////////////////////////////////////////

bot.on('inline_query', function (request) {
    const query = _.trim(request.query);
    console.log(`inline -> ${query}`);
    commands.answerInlineQuery(bot, request.id, query);
});

module.exports = bot;
