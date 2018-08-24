const Discord = require('discord.js');

class Command {

    init(client, settings, commands){
        throw new Error('You have to implement the method init!');
    }

    getName(){
        throw new Error('You have to implement the method getName!');
    }

    getHelp(){
        throw new Error('You have to implement the method getHelp!');
    }

    getUsage(){
        throw new Error('You have to implement the method getUsage!');
    }

    getGroup(){
        throw new Error('You have to implement the method getGroup!');
    }

    getRoles(){
        return ["moderator"];
    }

    sendHelp(channel){
        const embed = new Discord.RichEmbed()
            .setTitle("❗ | Příliš málo argumentů")
            .setDescription("Použití příkazu: `" + this.getUsage() + "`")
            .setColor(0xe74c3c);

        channel.send(embed);
    }

    sendError(channel, reason){
        const embed = new Discord.RichEmbed()
            .setTitle("❗ | Při odesílání příkazu nastala chyba")
            .setDescription(reason)
            .setColor(0xe74c3c);

        channel.send(embed);
    }

    call(args) {
        throw new Error('You have to implement the method call!');
    }

}

module.exports = Command;