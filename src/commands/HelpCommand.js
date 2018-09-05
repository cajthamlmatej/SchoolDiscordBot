
const Command = require("./Command");
const Discord = require('discord.js');

class VoteStartCommand extends Command {

    getName() {
        return "help";
    }
    getUsage(){
        return "help";
    }
    getHelp(){
        return "Zobrazí tuto nápovědu.";
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
            .setTitle("💼 | Nápověda k používání bota")
            .setColor(0xbadc58);
        
        let groups = {};
        Object.keys(this.commandsGroups).forEach(group => {
            groups[group] = [];
        });

        Object.values(this.commands).forEach(command => {
            groups[command.getGroup()].push(command);
        });

        let help = "";
        help += "List of commands that you can execute.\n\n";

        let member = message.member;
        let memberRoles = member.roles;

        Object.keys(groups).forEach(groupName => {
            let commands = groups[groupName];
            let commandsString = "";

            commands.forEach(command => {
                let name;
                
                command.getRoles().forEach(role => {
                    if(memberRoles.find(r => r.id == this.roles[role]) != undefined){
                        name = "**" + this.prefix + command.getUsage() + "**";
                        commandsString += name + " - " + command.getHelp() + " ";

                        if(command.getAliases().length > 0){
                            let aliasesText = "";

                            command.getAliases().forEach(alias => {
                                aliasesText += alias + ", ";
                            });

                            aliasesText = aliasesText.replace(/, +$/, '')
                            
                            commandsString += "[" + aliasesText + "]";
                        }

                        commandsString += "\n";
                    }
                });
            });

            if(commandsString != ""){
                help += this.commandsGroups[groupName] + "\n";
                help += commandsString;
                help += "\n";
            }
        });

        
        embed.setDescription(help);
    
        channel.send(embed).catch(console.error);
        return false;
    }

}

module.exports = VoteStartCommand;