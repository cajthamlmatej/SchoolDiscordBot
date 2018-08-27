
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
        this.commandsGroups = bot.settings["command-groups"];
        this.prefix = bot.settings["prefix"];
        this.commands = bot.commands;
    }

    call(args, channel){
        let embed = new Discord.RichEmbed()
            .setTitle("💼 | Nápověda k používání bota")
            .setColor(0x9b59b6);
        
        let groups = {};
        Object.keys(this.commandsGroups).forEach(group => {
            groups[group] = [];
        });

        Object.values(this.commands).forEach(command => {
            groups[command.getGroup()].push(command);
        });

        let help = "";
        help += "Příkazy, které může používat člen jsou označeny **__takto__**.\n\n";

        Object.keys(groups).forEach(groupName => {
            let commands = groups[groupName];

            help += this.commandsGroups[groupName] + "\n";
            commands.forEach(command => {
                let name;
                if(command.getRoles().includes("member"))
                    name = "**__" + this.prefix + command.getUsage() + "__**";
                else
                    name = "**" + this.prefix + command.getUsage() + "**";

                help += name + " - " + command.getHelp() + "\n";
            });

            help += "\n"
        });

        
        embed.setDescription(help);
    
        channel.send(embed).catch(console.error);
        return false;
    }

}

module.exports = VoteStartCommand;