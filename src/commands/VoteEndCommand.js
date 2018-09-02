const Command = require("./Command");

class VoteEndCommand extends Command {

    getName() {
        return "voteend";
    }
    getUsage(){
        return "voteend <jméno hlasování>"
    }
    getGroup(){
        return "vote";
    }
    getHelp(){
        return "Ukončí hlasování, zobrazí statistiky a výsledek hlasování."
    }

    init(bot) {
        this.voteModule = bot.modules["votemodule"];
        this.client = bot.client;
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

        this.voteModule.endVote(name);

        return false;
    }
}

module.exports = VoteEndCommand;