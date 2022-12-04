CREATE DATABASE IF NOT EXISTS akihabarabot CHARACTER SET utf8 COLLATE utf8_general_ci;
CREATE USER 'akihabarabot'@'localhost' IDENTIFIED BY 'dev';
GRANT ALL PRIVILEGES ON akihabarabot.* TO 'akihabarabot'@'localhost';
FLUSH PRIVILEGES;

USE akihabarabot;

CREATE TABLE `games` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `organizer` INT NOT NULL,
    `capacity` INT NOT NULL,
    `date` DATETIME NOT NULL,
    `game` varchar(150) NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `users` (
    `id` INT NOT NULL,
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `first_name` varchar(100) NOT NULL,
    `last_name` varchar(100) NOT NULL,
    `username` varchar(100) NOT NULL,
    PRIMARY KEY (`id`)
);

CREATE TABLE `players` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `created` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `modified` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `game` INT NOT NULL,
    `player` INT NOT NULL,
    PRIMARY KEY (`id`)
);

ALTER TABLE `games` ADD CONSTRAINT `games_fk0` FOREIGN KEY (`organizer`) REFERENCES `users`(`id`);

ALTER TABLE `players` ADD CONSTRAINT `players_fk0` FOREIGN KEY (`game`) REFERENCES `games`(`id`);

ALTER TABLE `players` ADD CONSTRAINT `players_fk1` FOREIGN KEY (`player`) REFERENCES `users`(`id`);
