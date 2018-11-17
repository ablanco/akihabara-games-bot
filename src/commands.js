// Copyright (c) 2018 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

/*global Promise*/

'use strict';

const sql = require('./sql.js'),
    { DateTime } = require('luxon'),
    _ = require('lodash');

const commands = {},
    utils = {},
    dateFormat = 'yyLLdd';

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

utils.renderGames = async function (games) {
    let players;

    players = _.map(games, function (game) {
        return sql.getPlayers(game.id);
    });
    players = await Promise.all(players);

    return _.map(games, function (game, i) {
        const date = DateTime.fromJSDate(game.date);
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

    user = await utils.getOrCreateUser(msg);

    datetime = code.substring(1, 9);
    datetime = DateTime.fromFormat(datetime, `${dateFormat}HH`);

    players = parseInt(code.substring(9), 10);

    sql.createGame(user.id, players, datetime, gameName);

    bot.sendMessage(user.id, 'Partida creada con éxito');
};

commands.listGames = async function (bot, msg, onlyGamesAsPlayer) {
    let games, response;

    if (onlyGamesAsPlayer) {
        games = await sql.getGamesAsPlayer(msg.from.id);
    } else {
        games = await sql.getGames();
    }

    response = await utils.renderGames(games);
    response = response.join('\n\n');

    if (response.length === 0) {
        response = 'No hay ninguna partida aún';
    }

    bot.sendMessage(msg.from.id, response);
};

commands.joinGameStart = async function (bot, msg) {
    let games = await sql.getGamesNotJoined(msg.from.id),
        players, keyboard;

    players = _.map(games, function (game) {
        return sql.getNumberOfPlayers(game.id);
    });
    players = await Promise.all(players);

    games = _.filter(games, function (game, i) {
        return game.capacity > players[i][0]['COUNT(id)'];
    });

    if (games.length === 0) {
        bot.sendMessage(msg.from.id, 'No hay partidas a las que puedas apuntarte');
        return;
    }

    keyboard = _.map(games, function (game) {
        const date = DateTime.fromJSDate(game.date);

        return [{
            'text': `${game.game} el ${date.toLocaleString(DateTime.DATETIME_SHORT)}`,
            'callback_data': `a${game.id}`
        }];
    });

    bot.sendMessage(msg.chat.id, 'Elige partida', {
        'reply_markup': {
            'inline_keyboard': keyboard
        }
    });
};

commands.joinGameEnd = async function (bot, msg) {
    const user = await utils.getOrCreateUser(msg),
        gameId = msg.data.substring(1),
        players = await sql.getPlayers(gameId);
    let game = await sql.getGame(gameId),
        date, alreadyJoined;

    alreadyJoined = _.some(players, function (player) {
        return player.id === user.id;
    });
    if (alreadyJoined) {
        bot.sendMessage(msg.from.id, 'Ya estabas apuntado a la partida, no puedes apuntarte dos veces');
        return;
    }

    game = game[0];
    if (game.capacity > players.length) {
        await sql.addPlayer(gameId, user.id);
        bot.sendMessage(msg.from.id, 'Te has apuntado con éxito a la partida');

        date = DateTime.fromJSDate(game.date);
        bot.sendMessage(game.organizer,
            `${user.first_name} ${user.last_name} se ha apuntado a la partida a ${game.game} el ${date.toLocaleString(DateTime.DATETIME_SHORT)}`
        );
    } else {
        bot.sendMessage(msg.from.id, 'Error, no quedan plazas libres en la partida');
    }
};

commands.leaveGameStart = async function (bot, msg) {
    let games = await sql.getGamesAsPlayer(msg.from.id),
        keyboard;

    if (games.length === 0) {
        bot.sendMessage(msg.from.id, 'No hay partidas en las que estés apuntado');
        return;
    }

    keyboard = _.map(games, function (game) {
        const date = DateTime.fromJSDate(game.date);

        return [{
            'text': `${game.game} el ${date.toLocaleString(DateTime.DATETIME_SHORT)}`,
            'callback_data': `r${game.id}`
        }];
    });

    bot.sendMessage(msg.chat.id, 'Elige partida', {
        'reply_markup': {
            'inline_keyboard': keyboard
        }
    });
};

commands.leaveGameEnd = async function (bot, msg) {
    const user = await utils.getOrCreateUser(msg),
        gameId = msg.data.substring(1);
    let game = await sql.getGame(gameId),
        date;

    game = game[0];
    if (game.organizer === user.id) {
        bot.sendMessage(msg.from.id, 'No te puedes retirar de la partida si eres el organizador');
        return;
    }

    await sql.deletePlayer(gameId, user.id);
    bot.sendMessage(msg.from.id, 'Te has retirado de la partida');

    date = DateTime.fromJSDate(game.date);
    bot.sendMessage(game.organizer,
        `${user.first_name} ${user.last_name} se ha retirado de la partida a ${game.game} el ${date.toLocaleString(DateTime.DATETIME_SHORT)}`
    );
};

commands.deleteGameStart = async function (bot, msg) {
    let games = await sql.getGamesAsOrganizer(msg.from.id),
        keyboard;

    if (games.length === 0) {
        bot.sendMessage(msg.from.id, 'No hay partidas que hayas organizado');
        return;
    }

    keyboard = _.map(games, function (game) {
        const date = DateTime.fromJSDate(game.date);

        return [{
            'text': `${game.game} el ${date.toLocaleString(DateTime.DATETIME_SHORT)}`,
            'callback_data': `c${game.id}`
        }];
    });

    bot.sendMessage(msg.chat.id, 'Elige partida para cancelar', {
        'reply_markup': {
            'inline_keyboard': keyboard
        }
    });
};

commands.deleteGameEnd = async function (bot, msg) {
    const user = await utils.getOrCreateUser(msg),
        gameId = msg.data.substring(1),
        players = await sql.getPlayers(gameId);
    let game = await sql.getGame(gameId),
        date, gameTitle;

    game = game[0];
    if (game.organizer !== user.id) {
        bot.sendMessage(msg.from.id, 'No puedes cancelar una la partida si no eres el organizador');
        return;
    }
    date = DateTime.fromJSDate(game.date);
    gameTitle = `${game.game} el ${date.toLocaleString(DateTime.DATETIME_SHORT)}`;

    await sql.deleteGameAndPlayers(gameId);

    _.forEach(players, function (player) {
        if (player.id !== game.organizer) {
            bot.sendMessage(player.id, `La partida a ${gameTitle} ha sido cancelada por el organizador`);
        }
    });
    bot.sendMessage(msg.from.id, 'Partida cancelada con éxito');
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
    } else if (msgType === 'a') {
        commands.joinGameEnd(bot, msg);
    } else if (msgType === 'r') {
        commands.leaveGameEnd(bot, msg);
    } else if (msgType === 'c') {
        commands.deleteGameEnd(bot, msg);
    } else {
        bot.sendMessage(msg.message.chat.id, msg.data);
    }
};

commands.answerInlineQuery = async function (bot, inlineId, query) {
    const games = await sql.getGames(),
        gameTexts = await utils.renderGames(games);
    let results, gamesData;

    if (query.length === 0) {
        results = [{
            'id': -1,
            'type': 'article',
            'title': 'Todas las partidas',
            'input_message_content': {
                'message_text': gameTexts.join('\n\n')
            }
        }];
    } else {
        gamesData = _.zip(games, gameTexts);
        results = _.map(_.filter(gamesData, function (gameData) {
            return _.lowerCase(gameData[0].game).indexOf(query) >= 0;
        }), function (gameData) {
            return {
                'id': gameData[0].id,
                'type': 'article',
                'title': gameData[0].game,
                'input_message_content': {
                    'message_text': gameData[1]
                }
            };
        });
    }

    bot.answerInlineQuery(inlineId, results);
};

module.exports = commands;
