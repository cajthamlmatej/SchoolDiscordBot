
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
    getHelp(){
        return "Vypíše list všech hlasování."
    }

    init(client, settings, commands) {
        this.channel = client.channels.find(channel => channel.id === settings.channels["admin-bot"]);
    }

    call(args){
        let name = args[0];
        let votes = fs.readFileSync("./temp/votes.json", "utf8");
        let votesObject = JSON.parse(votes);

        let list = "";

        Object.keys(votesObject["votes"]).forEach(voteKey => {
            let vote = votesObject["votes"][voteKey];

            list += "\n**" + voteKey + "** - " + vote["description"];
        });

        list += "\n"

     
        const embed = new Discord.RichEmbed()
            .setTitle("📆 | Seznam všech hlasování")
            .setDescription(list)
            .setColor(0xe67e22)
        
        this.channel.send(embed);
        return true;
    }

}

module.exports = VoteListCommand;