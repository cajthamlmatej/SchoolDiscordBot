
const Command = require("./Command");
const Discord = require('discord.js');
const Translation = require("../Translation");

class PurgeCommand extends Command {

    getName() {
        return "purge";
    }

    getGroup() {
        return "manage";
    }

    getRoles() {
        return ["admin"];
    }

    init(bot) {

    }

    call(args, message) {
        let channel = message.channel;
        if (args.length != 1) {
            this.sendHelp(channel);
            return;
        }

        let count = args[0];

        if (count <= 0 || count > 100) {
            this.sendError(channel, "command.purge.wrong-message-count")
            return;
        }

        channel.bulkDelete(count).then(messages => {
            let embed = new Discord.RichEmbed()
                .setTitle("🧙 | " + Translation.translate("command.purge.purged.title"))
                .setDescription(Translation.translate("command.purge.purged", messages.size))
                .setColor(0xbadc58);

            channel.send(embed).then(message => {
                message.delete(5000);
            });
        });

        return false;
    }

}

module.exports = PurgeCommand;