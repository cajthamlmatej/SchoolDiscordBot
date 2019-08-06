const SubsCommand = require("./SubsCommand");
const Translation = require("../Translation");

class VoteCommand extends SubsCommand {

    getSubCommands() {
        return {
            "start": {
                "arguments": 3,
                "roles": ["moderator"]
            },
            "end": {
                "arguments": 1,
                "roles": ["moderator"]
            },
            "list": {
                "arguments": 0,
                "roles": ["moderator"]
            },
            "delete": {
                "arguments": 1,
                "roles": ["moderator"]
            }
        };
    }

    getName() {
        return "vote";
    }

    getGroup() {
        return "vote";
    }

    getDependencies() {
        return ["votemodule"];
    }

    init(bot) {
        this.voteModule = bot.modules.votemodule;
        this.client = bot.client;
    }

    callEnd(args, message) {
        const channel = message.channel;
        const name = args[0];

        if (!this.voteModule.exists(name)) {
            this.sendError(channel, "command.vote.dont-exist");
            return;
        }

        this.voteModule.endVote(name);
    }

    async callStart(args, message) {
        const channel = message.channel;
        const [type, name, description] = args;

        let options = { "👍": Translation.translate("module.vote.yes"), "👎": Translation.translate("module.vote.no") };
        const optionsEmojis = this.voteModule.optionsEmojis;

        if (!["global", "private"].includes(type)) {
            this.sendError(channel, "command.vote.type-not-valid", "private, global");
            return;
        }

        if (await this.voteModule.exists(name)) {
            this.sendError(channel, "command.vote.already-exists");
            return;
        }

        if (args.length != 3) {
            const argOptions = args[3].split(";");

            if (argOptions.length > optionsEmojis.length) {
                this.sendError(channel, "command.vote.too-much.options");
                return;
            }

            options = {};

            let i = 0;
            argOptions.forEach(option => {
                options[optionsEmojis[i]] = option;

                i++;
            });
        }

        await this.voteModule.startVote(type, name, description, options, channel);
    }

    async callList(args, message) {
        await this.voteModule.printVoteList(message.author);
        message.react("✅");
    }

    async callDelete(args, message) {
        const channel = message.channel;
        const name = args[0];

        if (!await this.voteModule.exists(name)) {
            this.sendError(channel, "command.vote.dont-exist");
            return;
        }

        await this.voteModule.deleteVote(name, channel);
        return true;
    }
}

module.exports = VoteCommand;