
const Command = require("./Command");

class VoteDeleteCommand extends Command {

    getName() {
        return "votedelete";
    }
    getUsage(){
        return "votedelete <jméno hlasování>"
    }
    getGroup(){
        return "vote";
    }
    getHelp(){
        return "Smaže hlasování z paměti."
    }

    init(bot) {
        this.voteModule = bot.modules["votemodule"];
    }

    call(args, channel){
        if(args.length != 1){
            this.sendHelp(channel);
            return;
        }

        let name = args[0];
        
        if(!this.voteModule.exists(name)){
            this.sendError(channel, "Hlasování s tímto jménem nebylo nalezeno. Výpis všech hlasování provedete příkazem votelist.");
            return;
        }

        this.voteModule.deleteVote(name, channel);
        return false;
    }

}

module.exports = VoteDeleteCommand;