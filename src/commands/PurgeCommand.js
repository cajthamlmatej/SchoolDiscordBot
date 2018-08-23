
const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');

class PurgeCommand extends Command {

    getName() {
        return "purge";
    }
    getUsage() {
        return "purge <id channelu> <počet zpráv>"
    }
    getHelp() {
        return "Smaže zadaný počet zpráv v zadanném channelu."
    }

    init(client, settings, commands) {
        this.guild = client.channels.find(channel => channel.id === settings.channels["admin-bot"]).guild;
    }

    call(args){
        let channel = this.guild.channels.find(c => c.id == args[0]);

        let count = args[1];

        if(count <= 0 || count > 100)
            return;
        
        channel.fetchMessages({ limit: count })
            .then(messages => {
                channel.bulkDelete(messages);
            })
            .catch(console.error);

        return false;
    }

}

module.exports = PurgeCommand;