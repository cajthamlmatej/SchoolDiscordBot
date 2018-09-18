
const Command = require("./Command");
const Discord = require('discord.js');
const Translation = require("../Translation");

class ReloadCommand extends Command {

    getName() {
        return "reload";
    }

    getGroup() {
        return "manage";
    }

    init(bot) {
        this.bot = bot;
    }

    call(args, message) {
        message.react("✅");
        this.bot.reload();
    }

}

module.exports = ReloadCommand;