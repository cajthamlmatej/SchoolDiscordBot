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
        this.voteChannel = client.channels.find(channel => channel.id === settings.channels["vote"]);
    }

    call(args, channel){
        if(args.length != 1){
            this.sendHelp(channel);
            return;
        }

        let name = args[0];
        let votes = fs.readFileSync("./temp/votes.json", "utf8");
        let votesObject = JSON.parse(votes);
        let name = args[0];

        let vote = votesObject["votes"][name];

        if(vote == undefined){
            this.sendError(channel, "Hlasování s tímto jménem nebylo nalezeno. Výpis všech hlasování provedete příkazel votelist.");
            return;
        }
        let voteMessageId = vote["id"];

        this.voteChannel.fetchMessage(voteMessageId).then(message => {                
            let yesReactions = message.reactions.find(reaction => reaction.emoji.name === "👍");
            let yesCount = yesReactions.count - 1;
            let noReactions = message.reactions.find(reaction => reaction.emoji.name === "👎");
            let noCount = noReactions.count - 1;

            let allReactions = yesCount + noCount;
            let today = new Date();

            const embed = new Discord.RichEmbed()
                .setTitle("📆 | Konec hlasování \"" + name + "\"")
                .setDescription(vote["description"])
                .setColor(0xe67e22)
                .addField("🖐 Počet hlasů", allReactions, true)
                .addField("💪 Váha jednoho hlasu", 100 / allReactions + "%", true)
                .addBlankField()
                .addField("👍 Hlasů pro ANO", yesCount, true)
                .addField("👎 Hlasů pro NE", noCount, true)
                .addBlankField()
                .addField("👌 Procent potřeba pro schválení", "> 50%", true)
                .addField("👍 Pro v procentech", 100 / allReactions * yesCount + "%", true)
                .addBlankField()
                .addField("Výsledek", 100 / allReactions * yesCount > 50 ? "**SCHVÁLENO**" : "**NESCHÁVELNO**");;
            
            this.voteChannel.send(embed);
        }).catch(console.error);

        return false;
    }
}

module.exports = VoteStopCommand;