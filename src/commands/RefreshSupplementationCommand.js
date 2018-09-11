const Command = require("./Command");
const Discord = require('discord.js');

class RefreshSupplementationCommand extends Command {

    getName() {
        return "refreshsupplementation";
    }

    getGroup(){
        return "school";
    }
    
    getAliases(){
        return [ "refreshs" ];
    }
    
    getDependencies(){
        return [ "supplementationmodule" ];
    }

    init(bot) {
        this.supplementationModule = bot.modules.supplementationmodule;
    }

    call(args, message) {
        let channel = message.channel;
        this.supplementationModule.refresh(channel);

        return false;
    }

}

module.exports = RefreshSupplementationCommand;