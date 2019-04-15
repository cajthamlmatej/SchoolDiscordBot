const Command = require("./Command");
const Discord = require('discord.js');
const Translation = require("../Translation");

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
        let channel = message.channel;
        if (args.length != 2) {
            this.sendHelp(channel);
            return;
        }

        let channelName = args[0];
        let msg = args[1];

        let channelMatch = /<#([0-9]+)>/g.exec(channelName)[1];
        let channelSay = this.client.channels.find(ch => ch.id == channelMatch);


        const embed = new Discord.RichEmbed()
            .setTitle("🤐 | " + Translation.translate("command.notice.notice"))
            .setDescription(msg)
            .setFooter(message.author.username, message.author.avatarURL)
            .setColor(0xbadc58);

        channelSay.send(embed);

        return true;
    }

}

module.exports = SayCommand;