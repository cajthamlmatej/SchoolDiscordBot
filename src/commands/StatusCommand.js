
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
            .setTitle("📊  | Statistiky" + Translation.translate(""))
            .setColor(0xbadc58)
            .addField("Počet příkazů", "✅ " + Object.keys(this.commands).length + " a ❌ " + Object.keys(this.disabledCommands).length, true)
            .addField("Počet modulů", "✅ " + Object.keys(this.modules).length + " a ❌ " + Object.keys(this.disabledModules).length, true)
            .addField("Ping", this.client.ping + "ms", true)
            .addField("Autor", "Matěj Cajthaml [source (GitHub)](https://github.com/cajthamlmatej/SchoolDiscordBot)", true)
            .addField("Uptime", moment().diff(this.startTime, "hours") + " hodin", true);

        if (this.supplementationModule != undefined)
            embed.addField("Poslední kontrola suplování", "před " + moment().diff(this.supplementationModule.lastCheck, "minutes") + "m", true);

        channel.send(embed);
    }

}

module.exports = StatusCommand;