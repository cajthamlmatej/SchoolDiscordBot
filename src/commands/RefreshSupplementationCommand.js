const Command = require("./Command");
const Discord = require('discord.js');

class RefreshSupplementationCommand extends Command {

    getName() {
        return "refreshsupplementation";
    }
    getUsage() {
        return "refreshsupplementation"
    }
    getGroup(){
        return "school";
    }
    getHelp() {
        return "Okamžitě zkontroluje a upraví suplování."
    }

    init(bot) {
        this.supplementationModule = bot.modules["supplementationmodule"];
    }

    call(args, channel){
        this.supplementationModule.refresh(channel);

        return false;
    }

}

module.exports = RefreshSupplementationCommand;