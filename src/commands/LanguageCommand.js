const SubsCommand = require("./SubsCommand");
const Discord = require("discord.js");
const Translation = require("../Translation");
const Config = require("../Config");

class LanguageCommand extends SubsCommand {

    getSubCommands() {
        return {
            "change": {
                "arguments": 1,
                "roles": ["admin"]
            },
            "list": {
                "arguments": 0,
                "roles": ["admin"]
            }
        };
    }

    getName() {
        return "language";
    }

    getGroup() {
        return "manage";
    }

    getAliases() {
        return ["lan"];
    }

    init(bot) {

    }

    callList(args, message) {
        const languages = Translation.getLanguages();

        let list = "";

        languages.forEach(language => {
            list += "\n**" + language + "**";
        });

        list += "\n";

        const embed = new Discord.RichEmbed()
            .setTitle("🗣️ | " + Translation.translate("command.language.language-list"))
            .setDescription(list)
            .setColor(Config.getColor("SUCCESS"));

        message.author.createDM().then(dm => dm.send(embed)).catch(error => { });

        message.react("✅");
    }

    callChange(args, message) {
        const channel = message.channel;
        const language = args[0];

        if (!Translation.isValidLanguage(language)) {
            this.sendError(channel, "command.language.language-not-found");
            return;
        }

        Translation.setLanguage(language);
        const embed = new Discord.RichEmbed()
            .setTitle("🗣️ | " + Translation.translate("command.language.language-changed.title"))
            .setDescription(Translation.translate("command.language.language-changed"))
            .setColor(Config.getColor("SUCCESS"));

        channel.send(embed);
        return false;
    }

}

module.exports = LanguageCommand;