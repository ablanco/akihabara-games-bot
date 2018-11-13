// Copyright (c) 2018 Alejandro Blanco <alejandro.b.e@gmail.com>
// MIT License

const settings = {
    // https://mariadb.com/kb/en/library/getting-started-with-the-nodejs-connector/
    database: {
        host: 'localhost',
        user: 'akihabarabot',
        password: '',
        database: 'akihabarabot',
        connectionLimit: 5
    },
    token: ''
};

module.exports = settings;
