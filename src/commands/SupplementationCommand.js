const SubsCommand = require("./SubsCommand");
const Discord = require('discord.js');

class SupplementationCommand extends SubsCommand {

    getSubCommands(){
        return {
            "refresh": {
                "arguments": 0
            }
        }
    }

    getName() {
        return "supplementation";
    }

    getGroup(){
        return "school";
    }
    
    getAliases(){
        return [ "sup" ];
    }
    
    getDependencies(){
        return [ "supplementationmodule" ];
    }

    init(bot) {
        this.supplementationModule = bot.modules.supplementationmodule;
    }

    callRefresh(args, message) {
        let channel = message.channel;
        this.supplementationModule.refresh(channel);

        return false;
    }

}

module.exports = SupplementationCommand;