
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

    init(client, settings, commands) {
        this.channel = client.channels.find(channel => channel.id === settings.channels["admin-bot"]);
        this.prefix = settings.prefix;
        this.commands = commands;
    }

    call(args){
        let embed = new Discord.RichEmbed()
            .setTitle("💼 | Nápověda k používání bota")
            .setColor(0x9b59b6);
        
        Object.values(this.commands).forEach(command => {
            embed.addField(this.prefix + command.getUsage(), command.getHelp())
        });
        
        this.channel.send(embed).catch(console.error);
        return true;
    }

}

module.exports = VoteStartCommand;