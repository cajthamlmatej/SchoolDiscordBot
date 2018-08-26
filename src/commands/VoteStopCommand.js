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

    init(client, settings, commands) {
        this.client = client;
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
            this.sendError(channel, "Hlasování s tímto jménem nebylo nalezeno. Výpis všech hlasování provedete příkazel votelist.");
            return;
        }
        let voteMessageId = vote["id"];

        this.client.channels.find(c => c.id == vote["channel"]).fetchMessage(voteMessageId).then(message => {        
            let reactions = message.reactions;
            let reactionCount = 0;
            let winningCount = 0;
            let winningEmoji = "";

            reactions.forEach(reaction => {
                reactionCount += reaction.count - 1;
            });
            
            let votesString = "";
            let weight = 100 / reactionCount;
            
            reactions.forEach(reaction => {
                let count = reaction.count - 1;

                if(count > winningCount){
                    winningCount = count;
                    winningEmoji = reaction.emoji + "";
                }

                votesString += "`" + (count) + " hlasů (" + this.addZero(((count) * weight)) + "%)` " + reaction.emoji + " " + vote["options"][reaction.emoji] + "\n";
            });

            const embed = new Discord.RichEmbed()
                .setTitle("📆 | Konec hlasování \"" + name + "\"")
                .setDescription(vote["description"])
                .setColor(0xe67e22)
                .addField("☝ Hlasy", votesString, true)
                .addBlankField()
                .addField("🖐 Statistiky", "**Počet hlasů**: " + reactionCount + "\n**Váha jednoho hlasu**: " + weight+ "%\n", true)
                .addField("👍 Výsledek", "Vyhrála možnost **" + winningEmoji + " " + vote["options"][winningEmoji] + "**", true);
            
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