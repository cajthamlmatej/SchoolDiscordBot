const SubsCommand = require("./SubsCommand");

class VoteCommand extends SubsCommand {

    getSubCommands(){
        return {
            "start": {
                "arguments": 3,
                "help": "<global/private> <jméno hlasování> <popis hlasování> [možnosti rozdělene středníkem]"
            },
            "end": {
                "arguments": 1,
                "help": "<name>"
            },
            "list": {
                "arguments": 0,
                "help": ""
            },
            "delete": {
                "arguments": 1,
                "help": "<name>"
            }
        }
    }

    getName() {
        return "vote";
    }
    
    getGroup(){
        return "vote";
    }

    getHelp(){
        return "Command for managing votes.";
    }
    
    getDependencies(){
        return [ "votemodule" ];
    }

    init(bot) {
        this.voteModule = bot.modules.votemodule;
        this.client = bot.client;
    }

    callEnd(args, channel){
        let name = args[0];

        if(!this.voteModule.exists(name)){
            this.sendError(channel, "Hlasování s tímto jménem nebylo nalezeno. Výpis všech hlasování provedete příkazem votelist.");
            return;
        }

        this.voteModule.endVote(name);

        return false;
    }

    callStart(args, channel){
        let type = args[0];
        let name = args[1];
        let description = args[2];
        let options = this.voteModule.defaultOptions;
        let optionsEmojis = this.voteModule.optionsEmojis;

        if(!["global", "private"].includes(type)){
            this.sendError(channel, "První argument musí být zda se jedná o globální (global) nebo o soukromé (private) hlasování.");
            return;
        }
        
        if(this.voteModule.exists(name)){
            this.sendError(channel, "Hlasování s tímto jménem již existuje, zvolte prosím jiné jméno.");
            return;
        }

        if(args.length != 3){
            let argOptions = args[3].split(";");

            if(argOptions.length > optionsEmojis.length){
                this.sendError(channel, "Zadal jste více možností (>" + optionsEmojis.length + ") než je možné. Zadejte menší počet.");
                return;
            }

            options = {};

            let i = 0;
            argOptions.forEach(option => {
                options[optionsEmojis[i]] = option;   
                
                i++;
            });
        }

        this.voteModule.startVote(type, name, description, options, channel);

        return false;
    }

    callList(args, channel, user){
        this.voteModule.printVoteList(user);
        return false;
    }

    callDelete(args, channel){
        let name = args[0];
        
        if(!this.voteModule.exists(name)){
            this.sendError(channel, "Hlasování s tímto jménem nebylo nalezeno. Výpis všech hlasování provedete příkazem votelist.");
            return;
        }

        this.voteModule.deleteVote(name, channel);
        return false;
    }
}

module.exports = VoteCommand;