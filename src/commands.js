// Copyright (c) 2018 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

'use strict';

const sql = require('./sql.js'),
    { DateTime } = require('luxon'),
    _ = require('lodash');

const commands = {},
    dateFormat = 'yyLLdd';

commands.newGameStart = async function (bot, msg) {
    let day = DateTime.local(),
        start = day.weekday;
    const keyboard = [];

    _.forEach(_.range(0, 3), function (week) {
        keyboard.push(_.map(_.range(start, 8), function (weekday) {
            let difference = weekday - day.weekday,
                current;

            difference = difference + (7 * week);
            current = day.plus({days: difference});

            return {
                'text': `${current.weekdayShort[0]}${current.day}`,
                'callback_data': `n${current.toFormat(dateFormat)}`
            };
        }));
        start = 1;
    });

    bot.sendMessage(msg.chat.id, 'Elige fecha', {
        'reply_markup': {
            'inline_keyboard': keyboard
        }
    });
};

commands.newGameStep1 = async function (bot, msg) {
    const d = msg.data,
        keyboard = [
            [
                { 'text': '10:00', 'callback_data': `${d}10` },
                { 'text': '11:00', 'callback_data': `${d}11` },
                { 'text': '12:00', 'callback_data': `${d}12` },
                { 'text': '13:00', 'callback_data': `${d}13` }
            ], [
                { 'text': '15:00', 'callback_data': `${d}15` },
                { 'text': '16:00', 'callback_data': `${d}16` },
                { 'text': '17:00', 'callback_data': `${d}17` },
                { 'text': '18:00', 'callback_data': `${d}18` }
            ], [
                { 'text': '19:00', 'callback_data': `${d}19` },
                { 'text': '20:00', 'callback_data': `${d}20` },
                { 'text': '21:00', 'callback_data': `${d}21` },
                { 'text': '22:00', 'callback_data': `${d}22` }
            ]
        ];

    bot.sendMessage(msg.message.chat.id, 'Elige hora', {
        'reply_markup': {
            'inline_keyboard': keyboard
        }
    });
};

commands.newGameStep2 = async function (bot, msg) {
    const d = msg.data,
        keyboard = [
            [
                { 'text': '2', 'callback_data': `${d}2` },
                { 'text': '3', 'callback_data': `${d}3` },
                { 'text': '4', 'callback_data': `${d}4` },
                { 'text': '5', 'callback_data': `${d}5` },
                { 'text': '6', 'callback_data': `${d}6` },
                { 'text': '7', 'callback_data': `${d}7` },
                { 'text': '8', 'callback_data': `${d}8` }
            ]
        ];

    bot.sendMessage(msg.message.chat.id, 'Número de jugadores', {
        'reply_markup': {
            'inline_keyboard': keyboard
        }
    });
};

commands.newGameStep3 = async function (bot, msg) {
    const d = msg.data;

    bot.sendMessage(msg.message.chat.id, 'Escribe el nombre del juego');
    bot.sendMessage(msg.message.chat.id, d, {
        'reply_markup': {
            'force_reply': true
        }
    });
};

commands.newGameEnd = async function (bot, msg) {
    const code = _.get(msg, 'reply_to_message.text');
    let gameName = _.get(msg, 'text'),
        user, datetime, players;

    if (_.isUndefined(gameName)) {
        bot.sendMessage(msg.from.id, 'Error');
        return;
    }
    gameName = _.trim(gameName);
    if (gameName.length === 0) {
        bot.sendMessage(msg.from.id, 'El nombre del juego no puede estar vacío');
        return;
    }

    user = await sql.getUser(msg.from.id);
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

    datetime = code.substring(1, 9);
    datetime = DateTime.fromFormat(datetime, `${dateFormat}HH`);

    players = parseInt(code.substring(9), 10);

    sql.createGame(user.id, players, datetime, gameName);

    bot.sendMessage(user.id, 'Partida creada con éxito');
};

commands.processCallback = async function (bot, msg) {
    const dataLength = msg.data.length,
        msgType = msg.data[0];

    if (msgType === 'n') {
        // New game
        if (dataLength === 7) {
            commands.newGameStep1(bot, msg);
        } else if (dataLength === 9) {
            commands.newGameStep2(bot, msg);
        } else if (dataLength === 10) {
            commands.newGameStep3(bot, msg);
        }
    } else {
        bot.sendMessage(msg.message.chat.id, msg.data);
    }
};

module.exports = commands;
