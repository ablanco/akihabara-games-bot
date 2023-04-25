// Copyright (c) 2018 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

'use strict';

const settings = require('./settings.js'),
    commands = require('./commands.js'),
    TelegramBot = require('node-telegram-bot-api'),
    _ = require('lodash');

// TELEGRAM BOT ///////////////////////////////////////////////////////////////

const bot = new TelegramBot(settings.token, { polling: true });

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
/expulsar - Expulsar a un jugador de una partida que hayas organizado
`;

const groupHelpText = `Este bot permite organizar partidas de juegos de mesa. Para más comandos abre una conversación privada con el bot.

Comandos:
/ayuda - Describe el uso del bot
/lista - Listar todas las partidas (futuras)
`;

const notInGroups =
    'Este comando no se puede utilizar en un grupo, abre una conversación privada con el bot para ello.';

bot.onText(/\/start.*/, function (msg) {
    console.log(`${msg.from.id} -> start`);
    if (msg.chat.type !== 'private') {
        bot.sendMessage(msg.chat.id, groupHelpText);
    } else {
        bot.sendMessage(msg.from.id, helpText);
    }
});

bot.onText(/\/ayuda.*/, function (msg) {
    console.log(`${msg.from.id} -> ayuda`);
    if (msg.chat.type !== 'private') {
        bot.sendMessage(msg.chat.id, groupHelpText);
    } else {
        bot.sendMessage(msg.from.id, helpText);
    }
});

bot.onText(/\/nueva.*/, function (msg) {
    console.log(`${msg.from.id} -> nueva`);
    if (msg.chat.type !== 'private') {
        bot.sendMessage(msg.chat.id, notInGroups);
    } else {
        commands.newGameStart(bot, msg);
    }
});

bot.onText(/\/lista.*/, function (msg) {
    console.log(`${msg.from.id} -> lista`);
    commands.listGames(bot, msg);
});

bot.onText(/\/milista.*/, function (msg) {
    console.log(`${msg.from.id} -> milista`);
    if (msg.chat.type !== 'private') {
        bot.sendMessage(msg.chat.id, notInGroups);
    } else {
        commands.listGames(bot, msg, true);
    }
});

bot.onText(/\/apuntarse.*/, function (msg) {
    console.log(`${msg.from.id} -> apuntarse`);
    if (msg.chat.type !== 'private') {
        bot.sendMessage(msg.chat.id, notInGroups);
    } else {
        commands.joinGameStart(bot, msg);
    }
});

bot.onText(/\/retirarse.*/, function (msg) {
    console.log(`${msg.from.id} -> retirarse`);
    if (msg.chat.type !== 'private') {
        bot.sendMessage(msg.chat.id, notInGroups);
    } else {
        commands.leaveGameStart(bot, msg);
    }
});

bot.onText(/\/cancelar.*/, function (msg) {
    console.log(`${msg.from.id} -> cancelar`);
    if (msg.chat.type !== 'private') {
        bot.sendMessage(msg.chat.id, notInGroups);
    } else {
        commands.deleteGameStart(bot, msg);
    }
});

bot.onText(/\/expulsar.*/, function (msg) {
    console.log(`${msg.from.id} -> expulsar`);
    if (msg.chat.type !== 'private') {
        bot.sendMessage(msg.chat.id, notInGroups);
    } else {
        commands.expelPlayerStart(bot, msg);
    }
});

bot.onText(/.*/, function (msg) {
    const code = _.get(msg, 'reply_to_message.text');

    if (
        !_.isUndefined(code) &&
        code[0] === 'n' &&
        msg.chat.type === 'private'
    ) {
        commands.newGameEnd(bot, msg);
    }
});

bot.on('callback_query', function (msg) {
    commands.processCallback(bot, msg);
});

module.exports = bot;
