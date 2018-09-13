const Discord = require('discord.js');
const Command = require("./Command");
const Translation = require("../Translation");

class SubsCommand extends Command {

    getSubCommands() {
        throw new Error('You have to implement the method getSubCommands!');
    }

    call(args, message) {
        let channel = message.channel;

        if (args.length <= 0) {
            this.sendHelp(channel);
            return;
        }

        let subCommands = this.getSubCommands();
        let subCommandName = args[0];
        let subCommand = subCommands[subCommandName];

        if (subCommand == undefined) {
            this.sendHelp(channel);
            return;
        }

        if (args.length - 1 < subCommand.arguments) {
            this.sendHelp(channel, subCommandName);
            return;
        }

        var args = args.slice(1);

        return this["call" + subCommandName[0].toUpperCase() + subCommandName.slice(1)](args, message);
    }

    sendHelp(channel, subCommandName) {
        let embed;
        if (subCommandName == undefined) {
            embed = new Discord.RichEmbed()
                .setTitle("❗ | " + Translation.translate("command.too-few-arguments"))
                .setDescription(Translation.translate("command.usage") + " `" + this.getUsage() + "`")
                .setColor(0xf0932b);
        } else {
            embed = new Discord.RichEmbed()
                .setTitle("❗ | " + Translation.translate("command.too-few-arguments"))
                .setDescription(Translation.translate("command.usage") + " `" + this.getName() + " " + subCommandName + " " + Translation.translate("commands.usage." + this.getName() + "." + subCommandName) + "` - " + Translation.translate("commands.help." + this.getName() + "." + subCommandName))
                .setColor(0xf0932b);
        }

        channel.send(embed);
    }

}

module.exports = SubsCommand;