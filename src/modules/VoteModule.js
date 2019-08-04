const Module = require("./Module");
const Discord = require("discord.js");
const Translation = require("../Translation");
const Config = require("../Config");
const logger = require("../Logger");

const voteRepository = require("../database/Database").getRepository("vote");

class VoteModule extends Module {

    getName() {
        return "votemodule";
    }

    init(bot) {
        this.optionsEmojis = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];
        this.voteChannel = bot.client.channels.find(channel => channel.id === Config.get("channels.annoucement"));
        this.client = bot.client;
    }

    async exists(name) {
        return await voteRepository.doesVoteExistsWithName(name);
    }

    async getVote(name) {
        return await voteRepository.getVote(name);
    }

    async getVotes() {
        return await voteRepository.getVotes();
    }

    async printVoteList(user) {
        let list = "";
        const votes = await this.getVotes();

        votes.forEach(vote => {
            list += "\n**" + vote.name + "**";
        });

        if (list == "")
            list = Translation.translate("module.vote.no-vote-exists");
        else
            list += "\n";

        const embed = new Discord.RichEmbed()
            .setTitle("📆 | " + Translation.translate("module.vote.list"))
            .setDescription(list)
            .setColor(Config.getColor("SUCCESS"));

        user.createDM().then(dm => dm.send(embed)).catch(logger.error);
    }

    async deleteVote(name, channel) {
        const vote = await voteRepository.getVote(name);

        const voteChannel = this.client.channels.find(c => c.id == vote.channel);
        voteChannel.fetchMessage(vote.message).then(async (message) => {
            message.delete();
            await voteRepository.deleteVote(name);

            const embed = new Discord.RichEmbed()
                .setTitle("📆 | " + Translation.translate("module.vote.deleted.title"))
                .setDescription(Translation.translate("module.vote.deleted"))
                .setColor(Config.getColor("SUCCESS"));

            channel.send(embed);
        }).catch(error => {
            // Message not found, dont log anything
        });
    }

    startVote(type, name, description, options, channel) {
        let optionsString = "";

        Object.keys(options).forEach(optionEmoji => {
            optionsString += optionEmoji + " " + Translation.translate("module.vote.for") + " **" + options[optionEmoji] + "**\n";
        });

        const embed = new Discord.RichEmbed()
            .setTitle("📆 | " + Translation.translate("module.vote.new"))
            .setDescription(description + "\n\n" + Translation.translate("module.vote.vote") + ": \n" + optionsString)
            .setColor(Config.getColor("SUCCESS"));

        let voteChannel;

        if (type == "global")
            voteChannel = this.voteChannel;
        else
            voteChannel = channel;

        voteChannel.send(embed).then(async (message) => {
            let result = Promise.resolve();
            Object.keys(options).forEach(option => {
                result = result.then(() => message.react(option));
            });

            const decodedOptions = {};

            Object.keys(options).forEach(option => {
                decodedOptions[option.codePointAt(0)] = options[option]; 
            });

            await voteRepository.insert({
                name: name,
                description: description,
                message: message.id,
                options: decodedOptions,
                channel: voteChannel.id
            });
        }).catch(logger.error);
    }

    async endVote(name) {
        const vote = await this.getVote(name);
        const voteMessageId = vote.message;
        const channel = this.client.channels.find(c => c.id == vote.channel);

        channel.fetchMessage(voteMessageId).then(message => {
            const reactions = message.reactions;
            let reactionCount = 0;

            reactions.forEach(reaction => {
                if (!vote.options.has(reaction.emoji.name.codePointAt(0) + ""))
                    return;

                reactionCount += reaction.count - 1;
            });

            let votesString = "";
            const weight = 100 / reactionCount;

            const votes = {};

            reactions.forEach(reaction => {
                if (!vote.options.has(reaction.emoji.name.codePointAt(0) + ""))
                    return;

                const count = reaction.count - 1;

                votes[reaction.emoji] = count;

                votesString += "`" + (count) + " " + Translation.translate("module.vote.votes") + " (" + this.addZero(((count) * weight)) + "%)` " + reaction.emoji + " " + vote.options.get(reaction.emoji.name.codePointAt(0) + "") + "\n";
            });

            const sortedVotes = Object.keys(votes).sort(function (a, b) { return votes[b] - votes[a]; });
            const winners = [];
            winners.push(sortedVotes[0]);

            sortedVotes.forEach(vote => {
                if (votes[winners[0]] === votes[vote] && vote != winners[0]) 
                    winners.push(vote);
                
            });

            let winningChoice = "";

            logger.log(winners[0]);

            if (winners.length === 1) 
                winningChoice = Translation.translate("module.vote.option-won") + " **" + winners[0] + " " + vote.options.get(winners[0].codePointAt(0) + "") + "**";
            else {
                let choiceString = "";

                winners.forEach(winner => {
                    choiceString += winner + " " + vote.options.get(winner.codePointAt(0) + "");
                    if (winners[winners.length - 1] != winner) 
                        choiceString += ", ";
                    
                });

                winningChoice = Translation.translate("module.vote.options-won") + " **" + choiceString + "**";
            }

            const embed = new Discord.RichEmbed()
                .setTitle("📆 | " + Translation.translate("module.vote.end") + " \"" + name + "\"")
                .setDescription(vote.description)
                .setColor(Config.getColor("SUCCESS"))
                .addField("☝ " + Translation.translate("module.vote.options-votes"), votesString, true)
                .addBlankField()
                .addField("🖐 " + Translation.translate("module.vote.stats"), "**" + Translation.translate("module.vote.votes-count") + "**: " + reactionCount + "\n**" + Translation.translate("module.vote.vote-weight") + "**: " + weight + "%\n", true)
                .addField("👍 " + Translation.translate("module.vote.result"), winningChoice, true);

            channel.send(embed);
        }).catch(logger.error);
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