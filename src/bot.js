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

const helpText = 'Este bot... TODO';

bot.onText(/\/start.*/, function (msg) {
    console.log('start');
    bot.sendMessage(msg.from.id, helpText);
});

bot.onText(/\/ayuda.*/, function (msg) {
    console.log('ayuda');
    bot.sendMessage(msg.from.id, helpText);
});

bot.onText(/\/nueva.*/, function (msg) {
    console.log('nueva');
    commands.newGameStart(bot, msg);
});

bot.onText(/\/lista.*/, function (msg) {
    console.log('lista');
    commands.listGames(bot, msg);
});

bot.onText(/\/milista.*/, function (msg) {
    console.log('milista');
    commands.listGames(bot, msg, true);
});

bot.onText(/\/apuntarse.*/, function (msg) {
    console.log('apuntarse');
    commands.joinGameStart(bot, msg);
});

bot.onText(/\/retirarse.*/, function (msg) {
    console.log('retirarse');
    commands.leaveGameStart(bot, msg);
});

bot.onText(/\/borrar.*/, function (msg) {
    console.log('borrar');
    commands.listGames(bot, msg); // TODO
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

module.exports = bot;
