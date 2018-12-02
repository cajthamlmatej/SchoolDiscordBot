#!/usr/bin/env node
const SchoolDiscordBot = require("./SchoolDiscordBot");

console.log("School Discord Bot started, author of the bot is Matěj Cajthaml <cajthaml.matej@navarru.cz>.");
console.log("Creating instance of the School Discord Bot.");

bot = new SchoolDiscordBot();
bot.start();