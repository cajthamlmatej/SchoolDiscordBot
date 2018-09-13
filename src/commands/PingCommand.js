
const Command = require("./Command");
const Discord = require('discord.js');
const Translation = require("../Translation");

class PingCommand extends Command {

    getName() {
        return "ping";
    }

    getGroup() {
        return "main";
    }

    getRoles() {
        return ["member"];
    }

    init(bot) {
        this.client = bot.client;
    }

    call(args, message) {
        let channel = message.channel;
        let embed = new Discord.RichEmbed()
            .setTitle("🏓 | " + Translation.translate("command.ping"))
            .setDescription(Translation.translate("command.ping.ping") + " " + Math.round(this.client.pings[0]) + "ms")
            .setColor(0xbadc58);

        channel.send(embed);
        return false;
    }

}

module.exports = PingCommand;