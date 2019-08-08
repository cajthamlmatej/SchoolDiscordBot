const Command = require("./Command");
const Discord = require("discord.js");
const Translation = require("../Translation");
const Config = require("../Config");

class PurgeCommand extends Command {

    getName() {
        return "purge";
    }

    getGroup() {
        return "utilities";
    }

    getRoles() {
        return ["admin"];
    }

    init(bot) {

    }

    call(args, message) {
        const channel = message.channel;
        if (args.length != 1) {
            this.sendHelp(channel);
            return;
        }

        const count = args[0];

        if (count <= 0 || count > 100) {
            this.sendError(channel, "command.purge.wrong-message-count");
            return;
        }

        channel.bulkDelete(count).then(messages => {
            const embed = new Discord.RichEmbed()
                .setTitle("🧙 | " + Translation.translate("command.purge.purged.title"))
                .setDescription(Translation.translate("command.purge.purged", messages.size))
                .setColor(Config.getColor("SUCCESS"));

            channel.send(embed).then(message => {
                message.delete(5000).catch(() => {});
            }).catch();
        });

        return false;
    }

}

module.exports = PurgeCommand;
