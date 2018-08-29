
const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');

class VoteListCommand extends Command {

    getName() {
        return "votelist";
    }
    getUsage(){
        return "votelist"
    }
    getGroup(){
        return "vote";
    }
    getHelp(){
        return "Vypíše list všech hlasování do **DM**."
    }

    init(bot) {
        this.voteModule = bot.modules["votemodule"];
    }

    call(args, channel, user){
        this.voteModule.printVoteList(user);
        return false;
    }

}

module.exports = VoteListCommand;