const Discord = require("discord.js");
const Command = require("./Command");
const Translation = require("../Translation");
const Config = require("../Config");

class SubsCommand extends Command {

    getRoles(subCommand) {
        if (subCommand == undefined) 
            return ["member"];

        if (this.getSubCommands()[subCommand] == undefined) 
            return [];

        return this.getSubCommands()[subCommand].roles;
    }

    allCommandsRoles() {
        const roles = [];

        Object.values(this.getSubCommands()).forEach(subCommand => {
            subCommand.roles.forEach(role => {
                if (!roles.includes(role))
                    roles.push(role);
            });
        });

        return roles;
    }

    getSubCommands() {
        throw new Error("You have to implement the method getSubCommands!");
    }

    async call(args, message) {
        const channel = message.channel;

        if (args.length <= 0) {
            this.sendHelp(channel);
            return;
        }

        const subCommands = this.getSubCommands();
        const subCommandName = args[0];
        const subCommand = subCommands[subCommandName];

        if (subCommand == undefined) {
            this.sendHelp(channel);
            return;
        }

        if (args.length - 1 < subCommand.arguments) {
            this.sendHelp(channel, subCommandName);
            return;
        }

        const realArgs = args.slice(1);

        return await this["call" + subCommandName[0].toUpperCase() + subCommandName.slice(1)](realArgs, message);
    }

    sendHelp(channel, subCommandName) {
        let embed;
        if (subCommandName == undefined) 
            embed = new Discord.RichEmbed()
                .setTitle("❗ | " + Translation.translate("command.too-few-arguments"))
                .setDescription(Translation.translate("command.usage") + " `" + this.getUsage() + "`")
                .setColor(Config.getColor("WARNING"));
        else 
            embed = new Discord.RichEmbed()
                .setTitle("❗ | " + Translation.translate("command.too-few-arguments"))
                .setDescription(Translation.translate("command.usage") + " `" + this.getName() + " " + subCommandName + " " + Translation.translate("commands.usage." + this.getName() + "." + subCommandName) + "` - " + Translation.translate("commands.help." + this.getName() + "." + subCommandName))
                .setColor(Config.getColor("WARNING"));

        channel.send(embed);
    }

}

module.exports = SubsCommand;