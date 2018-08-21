
const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');

class VoteStopCommand extends Command {

    getName() {
        return "votestop";
    }
    getUsage(){
        return "votestop <jmeno hlasovani>"
    }
    getHelp(){
        return "Ukončí globální hlasování, zobrazí statistiky a výsledek hlasování."
    }

    init(client, settings, commands) {
        this.channel = client.channels.find(channel => channel.id === settings.channels["vote"]);
        this.botChannel = client.channels.find(channel => channel.id === settings.channels["admin-bot"]);
    }

    call(args){
        let name = args[0];
        let votes = fs.readFileSync("./temp/votes.json", "utf8");
        let votesObject = JSON.parse(votes);

        let voteMessage = votesObject["votes"][name];

        if(voteMessage == undefined){
            const embed = new Discord.RichEmbed()
                .setTitle("📆 | Hlasování \"" + name + "\" nenalezeno")
                .setDescription("Hlasování s tímto jménem nebylo nalezeno, výpis všech aktuálních hlasování provedete příkazem votelist.")
                .setColor(0xe74c3c);

            this.botChannel.send(embed);
            return;
        }
        let voteMessageId = voteMessage["id"];

        this.channel.fetchMessage(voteMessageId)
            .then(message => {                
                let yesReactions = message.reactions.find(reaction => reaction.emoji.name === "👍");
                let yesCount = yesReactions.count - 1;
                let noReactions = message.reactions.find(reaction => reaction.emoji.name === "👎");
                let noCount = noReactions.count - 1;

                let allReactions = yesCount + noCount;
                let today = new Date();

                const embed = new Discord.RichEmbed()
                    .setTitle("📆 | Konec hlasování \"" + name + "\"")
                    .setDescription(voteMessage["description"])
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
                
                this.channel.send(embed);
            }).catch(console.error);

        return true;
    }

    addZero(i) {
        if (i < 10) {
            i = "0" + i;
        }
        return i;
    }

}

module.exports = VoteStopCommand;