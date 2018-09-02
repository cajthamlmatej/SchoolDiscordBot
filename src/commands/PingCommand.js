
const Command = require("./Command");
const Discord = require('discord.js');

class PingCommand extends Command {

    getName() {
        return "ping";
    }
    getUsage() {
        return "ping"
    }
    getGroup(){
        return "main";
    }
    getRoles(){
        return ["member"];
    }
    getHelp() {
        return "Je bot aktivní?"
    }

    init(bot) {
        this.client = bot.client;
    }

    call(args, channel, author){
        let embed = new Discord.RichEmbed()
            .setTitle("🏓 | Odezva")
            .setDescription("Odezva bota je " + this.client.ping + "ms")
            .setColor(0x9b59b6);

        channel.send(embed);
        return false;
    }

}

module.exports = PingCommand;