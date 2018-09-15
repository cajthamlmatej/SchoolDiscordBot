
const Command = require("./Command");
const Discord = require('discord.js');
const Translation = require("../Translation");
const moment = require('moment');

class StatusCommand extends Command {

    getName() {
        return "status";
    }

    getGroup() {
        return "main";
    }

    getRoles() {
        return ["member"];
    }

    init(bot) {
        this.client = bot.client;
        this.commands = bot.commands;
        this.modules = bot.modules;
        this.disabledCommands = bot.disabledCommands;
        this.disabledModules = bot.disabledModules;
        this.startTime = bot.startTime;
        this.supplementationModule = bot.modules.supplementationmodule;
    }

    call(args, message) {
        let channel = message.channel;
        let embed = new Discord.RichEmbed()
            .setTitle("📊 | " + Translation.translate("command.status.stats"))
            .setColor(0xbadc58)
            .addField(Translation.translate("command.status.commands"), Translation.translate("command.status.number-of-commands", Object.keys(this.commands).length, Object.keys(this.disabledCommands).length), true)
            .addField(Translation.translate("command.status.modules"), Translation.translate("command.status.number-of-modules", Object.keys(this.modules).length, Object.keys(this.disabledModules).length), true)
            .addField(Translation.translate("command.status.ping"), Math.round(this.client.ping) + "ms", true)
            .addField(Translation.translate("command.status.author"), "Matěj Cajthaml [source (GitHub)](https://github.com/cajthamlmatej/SchoolDiscordBot)", true)
            .addField(Translation.translate("command.status.uptime"), Translation.translate("command.status.uptime-time", moment().diff(this.startTime, "hours")), true);

        if (this.supplementationModule != undefined)
            embed.addField(Translation.translate("command.status.supplementation.last-check.title"), Translation.translate("command.status.supplementation.last-check", moment().diff(this.supplementationModule.lastCheck, "minutes")), true);

        channel.send(embed);
    }

}

module.exports = StatusCommand;