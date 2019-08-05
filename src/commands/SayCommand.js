const Command = require("./Command");
const Discord = require("discord.js");
const Translation = require("../Translation");
const Config = require("../Config");

class SayCommand extends Command {

    getName() {
        return "say";
    }

    getGroup() {
        return "manage";
    }

    init(bot) {
        this.client = bot.client;
    }

    call(args, message) {
        const channel = message.channel;
        if (args.length != 2) {
            this.sendHelp(channel);
            return;
        }

        const channelName = args[0];
        const msg = args[1];

        const channelMatch = /<#([0-9]+)>/g.exec(channelName)[1];
        const channelSay = this.client.channels.find(ch => ch.id == channelMatch);

        const embed = new Discord.RichEmbed()
            .setTitle("🤐 | " + Translation.translate("command.notice.notice"))
            .setDescription(msg)
            .setFooter(message.author.username, message.author.avatarURL)
            .setColor(Config.getColor("SUCCESS"));

        channelSay.send(embed);

        return true;
    }

}

module.exports = SayCommand;