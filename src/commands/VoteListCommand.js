
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

    init(client, settings, commands) {
    }

    call(args, channel, user){
        let votes = fs.readFileSync("./temp/votes.json", "utf8");
        let votesObject = JSON.parse(votes);

        let list = "";

        Object.keys(votesObject["votes"]).forEach(voteKey => {
            let vote = votesObject["votes"][voteKey];

            list += "\n**" + voteKey + "**";
        });

        list += "\n"

     
        const embed = new Discord.RichEmbed()
            .setTitle("📆 | Seznam všech hlasování")
            .setDescription(list)
            .setColor(0xe67e22)
        
        user.createDM().then(dm => dm.send(embed)).catch(console.error);
        return false;
    }

}

module.exports = VoteListCommand;