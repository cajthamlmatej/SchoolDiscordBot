#!/usr/bin/env node
const logger = require("./Logger");
const SchoolDiscordBot = require("./SchoolDiscordBot");

logger.info("   _____      _                 _   _____  _                       _   ____        _   ");
logger.info("  / ____|    | |               | | |  __ \\(_)                     | | |  _ \\      | |  ");
logger.info(" | (___   ___| |__   ___   ___ | | | |  | |_ ___  ___ ___  _ __ __| | | |_) | ___ | |_ ");
logger.info("  \\___ \\ / __| '_ \\ / _ \\ / _ \\| | | |  | | / __|/ __/ _ \\| '__/ _` | |  _ < / _ \\| __|");
logger.info("  ____) | (__| | | | (_) | (_) | | | |__| | \\__ \\ (_| (_) | | | (_| | | |_) | (_) | |_ ");
logger.info(" |_____/ \\___|_| |_|\\___/ \\___/|_| |_____/|_|___/\\___\\___/|_|  \\__,_| |____/ \\___/ \\__|");
logger.info("");
logger.info("Author of the original Discord bot is Matěj Cajthaml <cajthaml.matej@navarru.cz> from Navarru.");
logger.info("Special thanks for Denis Lenger <lenger.denis@seznam.cz> for contribution.");
logger.info("This bot was made for my school class at SSPŠ (Smíchovská střední průmyslová škola - Smichov secondary technical school) but it can be used for any purpose.");
logger.info("We are opensource! Source files and LICENCE can be found on GitHub (https://github.com/cajthamlmatej/SchoolDiscordBot).");
logger.info("Copyright © 2019 Matěj Cajthaml");

logger.info("School Discord Bot is starting.");
logger.info("Creating bot instance.");

const bot = new SchoolDiscordBot();
logger.info("Starting bot.");
bot.start();