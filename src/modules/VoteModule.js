const Module = require("./Module");
const Discord = require("discord.js");
const Translation = require("../Translation");
const fs = require("fs");
const Config = require("../Config");

class VoteModule extends Module {

    getName() {
        return "votemodule";
    }

    init(bot) {
        this.tempFile = "./temp/votes.json";
        this.optionsEmojis = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];
        this.voteChannel = bot.client.channels.find(channel => channel.id === Config.get("channels.annoucement"));
        this.client = bot.client;
    }

    exists(name) {
        const votes = fs.readFileSync(this.tempFile, "utf8");
        const votesObject = JSON.parse(votes);

        return votesObject["votes"][name] != undefined;
    }

    getVote(name) {
        const votes = fs.readFileSync(this.tempFile, "utf8");
        const votesObject = JSON.parse(votes);

        return votesObject["votes"][name];
    }

    getVotes() {
        const votes = fs.readFileSync(this.tempFile, "utf8");
        const votesObject = JSON.parse(votes);

        return votesObject["votes"];
    }

    printVoteList(user) {
        let list = "";
        const votes = this.getVotes();

        Object.keys(votes).forEach(voteKey => {
            list += "\n**" + voteKey + "**";
        });

        if (list == "")
            list = Translation.translate("module.vote.no-vote-exists");
        else
            list += "\n";

        const embed = new Discord.RichEmbed()
            .setTitle("📆 | " + Translation.translate("module.vote.list"))
            .setDescription(list)
            .setColor(0xbadc58);

        user.createDM().then(dm => dm.send(embed)).catch(console.error);
    }

    deleteVote(name, channel) {
        const votes = fs.readFileSync(this.tempFile, "utf8");
        const votesObject = JSON.parse(votes);
        const vote = votesObject["votes"][name];

        const voteChannel = this.client.channels.find(c => c.id == vote["channel"]);
        voteChannel.fetchMessage(vote["id"]).then(message => {
            message.delete();
            delete votesObject["votes"][name];

            const embed = new Discord.RichEmbed()
                .setTitle("📆 | " + Translation.translate("module.vote.deleted.title"))
                .setDescription(Translation.translate("module.vote.deleted"))
                .setColor(0xbadc58);

            channel.send(embed);

            fs.writeFileSync(this.tempFile, JSON.stringify(votesObject));
        }).catch(error => {
            // Message not found, dont log anything
        });
    }

    startVote(type, name, description, options, channel) {
        const votes = fs.readFileSync(this.tempFile, "utf8");
        const votesObject = JSON.parse(votes);

        let optionsString = "";

        Object.keys(options).forEach(optionEmoji => {
            optionsString += optionEmoji + " " + Translation.translate("module.vote.for") + " **" + options[optionEmoji] + "**\n";
        });

        const embed = new Discord.RichEmbed()
            .setTitle("📆 | " + Translation.translate("module.vote.new"))
            .setDescription(description + "\n\n" + Translation.translate("module.vote.vote") + ": \n" + optionsString)
            .setColor(0xbadc58);

        let voteChannel;

        if (type == "global")
            voteChannel = this.voteChannel;
        else
            voteChannel = channel;

        voteChannel.send(embed).then(message => {
            let result = Promise.resolve();
            Object.keys(options).forEach(option => {
                result = result.then(() => message.react(option));
            });

            votesObject["votes"][name] = { "id": message.id, "description": description, "options": options, "channel": voteChannel.id };

            fs.writeFileSync(this.tempFile, JSON.stringify(votesObject));
        }).catch(console.error);
    }

    endVote(name) {
        const vote = this.getVote(name);
        const voteMessageId = vote["id"];
        const channel = this.client.channels.find(c => c.id == vote["channel"]);
        channel.fetchMessage(voteMessageId).then(message => {
            const reactions = message.reactions;
            let reactionCount = 0;

            reactions.forEach(reaction => {
                if (vote["options"][reaction.emoji] == undefined)
                    return;

                reactionCount += reaction.count - 1;
            });

            let votesString = "";
            const weight = 100 / reactionCount;

            const votes = {};

            reactions.forEach(reaction => {
                if (vote["options"][reaction.emoji] == undefined)
                    return;

                const count = reaction.count - 1;

                votes[reaction.emoji] = count;

                votesString += "`" + (count) + " " + Translation.translate("module.vote.votes") + " (" + this.addZero(((count) * weight)) + "%)` " + reaction.emoji + " " + vote["options"][reaction.emoji] + "\n";
            });

            const sortedVotes = Object.keys(votes).sort(function (a, b) { return votes[b] - votes[a]; });
            const winners = [];
            winners.push(sortedVotes[0]);

            sortedVotes.forEach(vote => {
                if (votes[winners[0]] === votes[vote] && vote != winners[0]) 
                    winners.push(vote);
                
            });

            let winningChoice = "";

            if (winners.length === 1) 
                winningChoice = Translation.translate("module.vote.option-won") + " **" + winners[0] + " " + vote["options"][winners[0]] + "**";
            else {
                let choiceString = "";

                winners.forEach(winner => {
                    choiceString += winner + " " + vote["options"][winner];
                    if (winners[winners.length - 1] != winner) 
                        choiceString += ", ";
                    
                });

                winningChoice = Translation.translate("module.vote.options-won") + " **" + choiceString + "**";
            }

            const embed = new Discord.RichEmbed()
                .setTitle("📆 | " + Translation.translate("module.vote.end") + " \"" + name + "\"")
                .setDescription(vote["description"])
                .setColor(0xbadc58)
                .addField("☝ " + Translation.translate("module.vote.options-votes"), votesString, true)
                .addBlankField()
                .addField("🖐 " + Translation.translate("module.vote.stats"), "**" + Translation.translate("module.vote.votes-count") + "**: " + reactionCount + "\n**" + Translation.translate("module.vote.vote-weight") + "**: " + weight + "%\n", true)
                .addField("👍 " + Translation.translate("module.vote.result"), winningChoice, true);

            channel.send(embed);
        }).catch(console.error);
    }

    addZero(i) {
        if (i < 10) 
            return "00" + i;
        else if (i < 100) 
            return "0" + i;

        return i;
    }

    event(name, args) {
    }

}

module.exports = VoteModule;