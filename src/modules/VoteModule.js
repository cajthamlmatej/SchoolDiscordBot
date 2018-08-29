const Module = require("./Module");
const Discord = require('discord.js');
const fs = require('fs');

class VoteModule extends Module {

    getName() {
        return "votemodule";
    }

    init(bot) {
        this.tempFile = "./temp/votes.json";
        this.defaultOptions = {"👍": "ANO", "👎": "NE"};
        this.optionsEmojis = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];
        this.voteChannel = bot.client.channels.find(channel => channel.id === bot.settings.channels["vote"]);
        this.client = bot.client;
    }

    exists(name){
        let votes = fs.readFileSync(this.tempFile, "utf8");
        let votesObject = JSON.parse(votes);
        
        return votesObject["votes"][name] != undefined;
    }

    getVote(name){
        let votes = fs.readFileSync(this.tempFile, "utf8");
        let votesObject = JSON.parse(votes);
        
        return votesObject["votes"][name];
    }

    getVotes(){
        let votes = fs.readFileSync(this.tempFile, "utf8");
        let votesObject = JSON.parse(votes);
        
        return votesObject["votes"];
    }

    printVoteList(user){
        let list = "";
        let votes = this.getVotes();

        Object.keys(votes).forEach(voteKey => {
            let vote = votes[voteKey];

            list += "\n**" + voteKey + "**";
        });

        list += "\n"

     
        const embed = new Discord.RichEmbed()
            .setTitle("📆 | Seznam všech hlasování")
            .setDescription(list)
            .setColor(0xe67e22)
        
        user.createDM().then(dm => dm.send(embed)).catch(console.error);
    }

    deleteVote(name, channel){
        let votes = fs.readFileSync(this.tempFile, "utf8");
        let votesObject = JSON.parse(votes);
        
        delete votesObject["votes"][name];

        const embed = new Discord.RichEmbed()
            .setTitle("📆 | Hlasování bylo smazáno.")
            .setDescription("Hlasování bylo úspěšně smazáno z paměti.")
            .setColor(0xe67e22);

        channel.send(embed);

        fs.writeFileSync(this.tempFile, JSON.stringify(votesObject));
    }

    startVote(type, name, description, options, channel){
        let votes = fs.readFileSync(this.tempFile, "utf8");
        let votesObject = JSON.parse(votes);

        let optionsString = "";

        Object.keys(options).forEach(optionEmoji => {
            optionsString += optionEmoji + " pro **" + options[optionEmoji] + "**\n";
        });

        let embed = new Discord.RichEmbed()
            .setTitle("📆 | Nové hlasování")
            .setDescription(description + "\n\nhlasujte pomocí reakce pro možnosti: \n" + optionsString)
            .setColor(0xe67e22);

        let voteChannel;
        
        if(type == "global")
            voteChannel = this.voteChannel;
        else 
            voteChannel = channel;

        voteChannel.send(embed).then(message => {
            let result = Promise.resolve();
            Object.keys(options).forEach(option => {
                result = result.then(() => message.react(option));
            });

            votesObject["votes"][name] = {"id": message.id, "description": description, "options": options, "channel": channel.id};

            fs.writeFileSync(this.tempFile, JSON.stringify(votesObject));
        }).catch(console.error);
    }

    endVote(name){
        let vote = this.getVote(name);
        let voteMessageId = vote["id"];
        let channel = this.client.channels.find(c => c.id == vote["channel"]);
        channel.fetchMessage(voteMessageId).then(message => {        
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
                if(votes[winners[0]] === votes[vote] && vote != winners[0]){
                    winners.push(vote);
                }
            });

            let winningChoice = "";

            if(winners.length === 1){
                winningChoice = "Vyhrála možnost **" + winners[0] + " " + vote["options"][winners[0]] + "**";
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
            
            channel.send(embed);
        }).catch(console.error);
    }

    addZero(i){
        if (i < 10){
            return "00" + i; 
        } else if(i < 100){
            return "0" + i;
        }

        return i;
    }

    event(name, args){
    }

}

module.exports = VoteModule;