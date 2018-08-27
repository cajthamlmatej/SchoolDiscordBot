
const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');

class PurgeCommand extends Command {

    getName() {
        return "purge";
    }
    getUsage() {
        return "purge <počet zpráv>"
    }
    getGroup(){
        return "manage";
    }
    getHelp() {
        return "Smaže zadaný počet zpráv v aktuálním channelu."
    }

    init(bot) {
    }

    call(args, channel){
        if(args.length != 1){
            this.sendHelp(channel);
            return;
        }

        let count = args[0];

        if(count <= 0 || count > 100){
            this.sendError(channel, "Zadaný počet zpráv, které se mají smazat není správný. Minimum zpráv je 1 a nejvíce je 100.")
            return;
        }
        
        channel.fetchMessages({ limit: count })
            .then(messages => {
                channel.bulkDelete(messages);
            })
            .catch(console.error);

        return false;
    }

}

module.exports = PurgeCommand;