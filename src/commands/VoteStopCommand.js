const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');

class VoteStopCommand extends Command {

    getName() {
        return "votestop";
    }
    getUsage(){
        return "votestop <jméno hlasování>"
    }
    getGroup(){
        return "vote";
    }
    getHelp(){
        return "Ukončí hlasování, zobrazí statistiky a výsledek hlasování."
    }

    init(bot) {
        this.client = bot.client;
    }

    call(args, channel){
        if(args.length != 1){
            this.sendHelp(channel);
            return;
        }

        let name = args[0];
        let votes = fs.readFileSync("./temp/votes.json", "utf8");
        let votesObject = JSON.parse(votes);

        let vote = votesObject["votes"][name];

        if(vote == undefined){
            this.sendError(channel, "Hlasování s tímto jménem nebylo nalezeno. Výpis všech hlasování provedete příkazem votelist.");
            return;
        }
        let voteMessageId = vote["id"];

        this.client.channels.find(c => c.id == vote["channel"]).fetchMessage(voteMessageId).then(message => {        
            let reactions = message.reactions;
            let reactionCount = 0;

            reactions.forEach(reaction => {
                if(vote["options"][reaction.emoji] == undefined)
                    return;
                
                reactionCount += reaction.count - 1;
            });
            
            let votesString = "";
            let weight = 100 / reactionCount;

            let votes = {};
            
            reactions.forEach(reaction => {
                if(vote["options"][reaction.emoji] == undefined)
                    return;
                    
                let count = reaction.count - 1;

                votes[reaction.emoji] = count;

                votesString += "`" + (count) + " hlasů (" + this.addZero(((count) * weight)) + "%)` " + reaction.emoji + " " + vote["options"][reaction.emoji] + "\n";
            });

            let sortedVotes = Object.keys(votes).sort(function(a, b) { return votes[b] - votes[a]; });
            let winners = [];
            winners.push(sortedVotes[0]);

            sortedVotes.forEach(vote => {
                if(votes[winners[0]] === votes[vote]){
                    winners.push(vote);
                }
            });

            let winningChoice = "";

            if(winners.length === 1){
                winningChoice = "Vyhrála možnost **" + winningEmoji + " " + vote["options"][winningEmoji] + "**";
            }else {
                let choiceString = "";

                winners.forEach(winner => {
                    choiceString += winner + " " + vote["options"][winner];
                    if(winners[winners.length - 1] != winner){
                        choiceString += ", ";
                    }
                });

                winningChoice = "Vyhrály možnosti **" + choiceString + "**";
            }

            const embed = new Discord.RichEmbed()
                .setTitle("📆 | Konec hlasování \"" + name + "\"")
                .setDescription(vote["description"])
                .setColor(0xe67e22)
                .addField("☝ Hlasy", votesString, true)
                .addBlankField()
                .addField("🖐 Statistiky", "**Počet hlasů**: " + reactionCount + "\n**Váha jednoho hlasu**: " + weight+ "%\n", true)
                .addField("👍 Výsledek", winningChoice, true);
            
            this.client.channels.find(c => c.id == vote["channel"]).send(embed);
        }).catch(console.error);

        return false;
    }

    addZero(i){
        if (i < 10){
            return "00" + i; 
        } else if(i < 100){
            return "0" + i;
        }

        return i;
    }
}

module.exports = VoteStopCommand;