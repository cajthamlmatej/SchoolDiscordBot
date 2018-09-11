
const Command = require("./Command");
const Discord = require('discord.js');
const Translation = require("../Translation");

class HelpCommand extends Command {

    getName() {
        return "help";
    }

    getGroup(){
        return "main";
    }

    getRoles(){
        return ["member"];
    }

    init(bot) {
        this.commandsGroups = bot.settings.commands.groups;
        this.prefix = bot.settings.prefix;
        this.roles = bot.settings.roles.permission;
        this.commands = bot.commands;
    }

    call(args, channel, author, message){
        let embed = new Discord.RichEmbed()
            .setTitle("💼 | " + Translation.translate("command.help.title"))
            .setColor(0xbadc58);
        
        let groups = {};

        Object.values(this.commands).forEach(command => {
            let group = command.getGroup();
            if(groups[group] == undefined){
                groups[group] = [];
            }

            groups[group].push(command);
        });

        let help = Translation.translate("command.help.can-execute") + "\n\n";

        let member = message.member;
        let memberRoles = member.roles;

        Object.keys(groups).forEach(groupName => {
            let commands = groups[groupName];
            let commandsString = "";

            commands.forEach(command => {
                let name;
                
                command.getRoles().forEach(role => {
                    if(memberRoles.find(r => r.id == this.roles[role]) != undefined){
                        let aliasesText = "";

                        if(command.getAliases().length > 0){
                            command.getAliases().forEach(alias => {
                                aliasesText += alias + ", ";
                            });

                            aliasesText = aliasesText.replace(/, +$/, '')
                        }
                        
                        let cmdName = command.getName();

                        name = "**" + this.prefix + command.getUsage() + (aliasesText != "" ? " [" +aliasesText + "]" : "") +  "**";
                        commandsString += name + " - " + Translation.translate("commands.help." + cmdName) + " ";

                        commandsString += "\n";
                    }
                });
            });

            if(commandsString != ""){
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