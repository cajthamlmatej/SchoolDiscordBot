const DirectCommand = require("./DirectCommand");
const Discord = require('discord.js');
const Translation = require("../Translation");

class BakalariCommand extends DirectCommand {

    getName() {
        return "bakalari";
    }

    getGroup() {
        return "main";
    }

    getRoles() {
        return ["member"];
    }

    init(bot) {
        this.client = bot.client;
        this.directBakalariModule = bot.modules["directbakalarimodule"];
    }

    call(args, message) {
        let channel = message.channel;

        if(args.length == 0) {
            this.sendHelp(channel);
            return;
        }

        let rssToken = args[0];

        this.directBakalariModule.addRssTokenForUser(message.author.id, rssToken);

        const embed = new Discord.RichEmbed()
            .setTitle("📣 | RSS token změněn.")
            .setDescription("RSS token byl změněn. Během pár minut dostanete upozornění o známkách. Pokuď se tak nestane do hodiny a bot je online, nejspíše jste zadali špatný token - proto jej zadejte znovu a správně (vše za ?bk=).")
            .setColor(0xe67e22)

        channel.send(embed);

        return false;
    }

}

module.exports = BakalariCommand;