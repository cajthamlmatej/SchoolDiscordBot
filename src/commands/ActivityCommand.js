const Command = require("./Command");
const Discord = require("discord.js");
const Translation = require("../Translation");
const fs = require("fs");
const Config = require("../Config");

class ActivityCommand extends Command {

    getName() {
        return "activity";
    }

    getGroup() {
        return "utilities";
    }

    getRoles() {
        return ["moderator"];
    }

    init(bot) {
        this.client = bot.client;
        this.activity = Config.get("bot.activity");
        this.activityTempFile = "./activity.json";
    }
    call(args, message) {
        const activityRequest = args.join(" ");

        if (activityRequest.length > 128 || activityRequest.length < 3) {
            message.react("❌");
            message.channel.send(Translation.translate("command.activity.error"));
        } else {
            this.saveActivity(activityRequest);
            this.client.user.setActivity(activityRequest);
            message.react("✅");
        }
    }

    saveActivity(activityString) {
        fs.writeFileSync(this.activityTempFile, JSON.stringify({ "activityString": activityString }));
    }
}
module.exports = ActivityCommand;