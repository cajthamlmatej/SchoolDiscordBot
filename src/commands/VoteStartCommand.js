
const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');

class VoteStartCommand extends Command {

    getName() {
        return "votestart";
    }
    getUsage(){
        return "votestart <global/private> <jméno hlasování> <popis hlasování> [možnosti rozdělene středníkem]"
    }
    getGroup(){
        return "vote";
    }
    getHelp(){
        return "Vytvoří hlasování o zadané věci."
    }

    init(bot) {
        this.voteModule = bot.modules["votemodule"];
    }

    call(args, channel){
        if(args.length < 3 && args.length > 4){
            this.sendHelp(channel);
            return;
        }

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

}

module.exports = VoteStartCommand;