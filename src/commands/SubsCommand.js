const Discord = require('discord.js');
const Command = require("./Command");

class SubsCommand extends Command {

    getSubCommands(){
        throw new Error('You have to implement the method getSubCommands!');
    }

    getUsage() {
        let subCommands = Object.keys(this.getSubCommands());
        let list = "";

        subCommands.forEach(command => {
            list += command + "/";
        });

        list = list.replace(/\/+$/, '');

        return this.getName() + " <" + list + ">";
    }

    call(args, channel, user) {
        if(args.length <= 0){
            this.sendHelp(channel);
            return;
        }

        let subCommands = this.getSubCommands();
        let subCommandName = args[0];
        let subCommand = subCommands[subCommandName];

        if(subCommand == undefined){
            this.sendHelp(channel);
            return;
        }

        if(args.length - 1 < subCommand.arguments){
            this.sendHelp(channel, subCommandName);
            return;
        }

        var args = args.slice(1);

        this["call" + subCommandName[0].toUpperCase() + subCommandName.slice(1)](args, channel, user);
    }

    sendHelp(channel, subCommandName){
        let embed;
        if(subCommandName == undefined){
            embed = new Discord.RichEmbed()
                .setTitle("❗ | Příliš málo argumentů")
                .setDescription("Použití příkazu: `" + this.getUsage() + "`")
                .setColor(0xf0932b);
        } else {
            embed = new Discord.RichEmbed()
                .setTitle("❗ | Příliš málo argumentů")
                .setDescription("Použití příkazu: `" + this.getName() + " " + subCommandName + " " + this.getSubCommands()[subCommandName].help + "`")
                .setColor(0xf0932b);
        }

        channel.send(embed);
    }

}

module.exports = SubsCommand;