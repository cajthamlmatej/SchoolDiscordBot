const SubsCommand = require("./SubsCommand");
const Translation = require("../Translation");

class VoteCommand extends SubsCommand {

    getSubCommands(){
        return {
            "start": {
                "arguments": 3
            },
            "end": {
                "arguments": 1
            },
            "list": {
                "arguments": 0
            },
            "delete": {
                "arguments": 1
            }
        }
    }

    getName() {
        return "vote";
    }
    
    getGroup(){
        return "vote";
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
            this.sendError(channel, "command.vote.dont-exist");
            return;
        }

        this.voteModule.endVote(name);

        return true;
    }

    callStart(args, channel){
        let type = args[0];
        let name = args[1];
        let description = args[2];
        let options = {"👍": Translation.translate("module.vote.yes"), "👎": Translation.translate("module.vote.no")};;
        let optionsEmojis = this.voteModule.optionsEmojis;

        if(!["global", "private"].includes(type)){
            this.sendError(channel, "command.vote.type-not-valid", "private, global");
            return;
        }
        
        if(this.voteModule.exists(name)){
            this.sendError(channel, "command.vote.already-exists");
            return;
        }

        if(args.length != 3){
            let argOptions = args[3].split(";");

            if(argOptions.length > optionsEmojis.length){
                this.sendError(channel, "command.vote.too-much.options");
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

        return true;
    }

    callList(args, channel, user){
        this.voteModule.printVoteList(user);
        return true;
    }

    callDelete(args, channel){
        let name = args[0];
        
        if(!this.voteModule.exists(name)){
            this.sendError(channel, "command.vote.dont-exist");
            return;
        }

        this.voteModule.deleteVote(name, channel);
        return true;
    }
}

module.exports = VoteCommand;