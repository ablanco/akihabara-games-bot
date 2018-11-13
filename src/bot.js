// Copyright (c) 2018 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

'use strict';

const settings = require('./settings.js'),
    commands = require('./commands.js'),
    { DateTime } = require('luxon'),
    _ = require('lodash'),
    TelegramBot = require('node-telegram-bot-api');

// TELEGRAM BOT ///////////////////////////////////////////////////////////////

const bot = new TelegramBot(settings.token, {polling: true});

// COMMANDS ///////////////////////////////////////////////////////////////////

const helpText = 'TODO';

bot.onText(/\/help.*/, function (msg) {
    bot.sendMessage(msg.from.id, helpText);
});

bot.onText(/\/ayuda.*/, function (msg) {
    bot.sendMessage(msg.from.id, helpText);
});

const dateFormat = 'yyLLdd';

bot.onText(/\/nueva.*/, function (msg) {
    let day = DateTime.local(),
        start = day.weekday;
    const keyboard = [];

    console.log('nueva partida');

    _.forEach(_.range(0, 3), function (week) {
        keyboard.push(_.map(_.range(start, 8), function (weekday) {
            let difference = weekday - day.weekday,
                current;

            difference = difference + (7 * week);
            current = day.plus({days: difference});

            return {
                'text': `${current.weekdayShort[0]}${current.day}`,
                'callback_data': current.toFormat(dateFormat)
            };
        }));
        start = 1;
    });

    console.log(keyboard);

    bot.sendMessage(msg.chat.id, 'Elige fecha', {
        'reply_markup': {
            'inline_keyboard': keyboard
        }
    });
});

bot.on('callback_query', function (msg) {
    commands.processCallback(bot, msg);
});

// INLINE MODE ////////////////////////////////////////////////////////////////

bot.on('inline_query', function (request) {
});

module.exports = bot;
