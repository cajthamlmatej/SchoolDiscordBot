const Command = require("./Command");
const Discord = require("discord.js");
const Translation = require("../Translation");

class PingCommand extends Command {

    getName() {
        return "ping";
    }

    getGroup() {
        return "utilities";
    }

    getRoles() {
        return ["member"];
    }

    init(bot) {
        this.client = bot.client;
    }

    call(args, message) {
        const channel = message.channel;
        const embed = new Discord.RichEmbed()
            .setTitle("🏓 | " + Translation.translate("command.ping"))
            .setDescription(Translation.translate("command.ping.ping", Math.round(this.client.pings[0])))
            .setColor(0xbadc58);

        channel.send(embed);
        return false;
    }

}

module.exports = PingCommand;
