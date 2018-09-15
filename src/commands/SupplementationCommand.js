const SubsCommand = require("./SubsCommand");
const Discord = require('discord.js');
const moment = require('moment');
const Translation = require("../Translation");

class SupplementationCommand extends SubsCommand {

    getSubCommands() {
        return {
            "refresh": {
                "arguments": 0,
                "roles": ["moderator"]
            },
            "lastcheck": {
                "arguments": 0,
                "roles": ["member"]
            },
        }
    }

    getName() {
        return "supplementation";
    }

    getGroup() {
        return "school";
    }

    getAliases() {
        return ["sup"];
    }

    getDependencies() {
        return ["supplementationmodule"];
    }

    init(bot) {
        this.supplementationModule = bot.modules.supplementationmodule;
    }

    callRefresh(args, message) {
        let channel = message.channel;
        this.supplementationModule.refresh(channel);

        return false;
    }

    callLastcheck(args, message){
        let channel = message.channel;

        const embed = new Discord.RichEmbed()
            .setTitle("👓 | " + Translation.translate("command.supplementation.lastcheck.title"))
            .setColor(0xbadc58)
            .setDescription(Translation.translate("command.supplementation.lastcheck", moment().diff(this.supplementationModule.lastCheck, "minutes")));

        channel.send(embed);

        return false;
    }

}

module.exports = SupplementationCommand;