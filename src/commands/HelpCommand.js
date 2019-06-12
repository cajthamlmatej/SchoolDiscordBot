const Command = require("./Command");
const Discord = require("discord.js");
const Translation = require("../Translation");

class HelpCommand extends Command {

    getName() {
        return "help";
    }

    getGroup() {
        return "main";
    }

    getRoles() {
        return ["member"];
    }

    init(bot) {
        this.commandsGroups = bot.settings.commands.groups;
        this.prefix = bot.settings.prefix;
        this.roles = bot.settings.roles.permission;
        this.commands = bot.commands;
    }

    call(args, message) {
        const channel = message.channel;
        const embed = new Discord.RichEmbed()
            .setTitle("💼 | " + Translation.translate("command.help.title"))
            .setColor(0xbadc58);

        const groups = {};

        Object.values(this.commands).forEach(command => {
            const group = command.getGroup();
            if (groups[group] == undefined) 
                groups[group] = [];

            groups[group].push(command);
        });

        let help = Translation.translate("command.help.can-execute") + "\n\n";

        const member = message.member;
        const memberRoles = member.roles;

        Object.keys(groups).forEach(groupName => {
            const commands = groups[groupName];
            let commandsString = "";

            commands.forEach(command => {
                let canUse = false;

                command.allCommandsRoles().forEach(role => {
                    if (memberRoles.find(r => r.id == this.roles[role]) != undefined) 
                        canUse = true;
                    
                });

                if (!canUse) 
                    return;

                let aliasesText = "";

                if (command.getAliases().length > 0) {
                    command.getAliases().forEach(alias => {
                        aliasesText += alias + ", ";
                    });

                    aliasesText = aliasesText.replace(/, +$/, "");
                }

                const cmdName = command.getName();

                const name = "**" + this.prefix + command.getUsage() + (aliasesText != "" ? " [" + aliasesText + "]" : "") + "**";
                commandsString += name + " - " + Translation.translate("commands.help." + cmdName) + " \n";
            });

            if (commandsString != "") {
                help += Translation.translate("commands.group." + groupName) + "\n";
                help += commandsString;
                help += "\n";
            }
        });

        embed.setDescription(help);

        channel.send(embed).catch(console.error);
        return false;
    }

}

module.exports = HelpCommand;