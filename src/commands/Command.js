const Discord = require("discord.js");
const Translation = require("../Translation");
const Config = require("../Config");

class Command {

    init(client) {
        throw new Error("You have to implement the method init!");
    }

    getName() {
        throw new Error("You have to implement the method getName!");
    }

    getGroup() {
        throw new Error("You have to implement the method getGroup!");
    }

    getAliases() {
        return [];
    }

    getDependencies() {
        return [];
    }

    fetchAliases() {
        return [this.getName()].concat(this.getAliases());
    }

    getRoles() {
        return ["moderator"];
    }

    allCommandsRoles() {
        return this.getRoles();
    }

    getUsage() {
        return this.getName() + " " + Translation.translate("commands.usage." + this.getName());
    }

    sendHelp(channel) {
        const embed = new Discord.RichEmbed()
            .setTitle("❗ | " + Translation.translate("command.too-few-arguments"))
            .setDescription(Translation.translate("command.usage") + " `" + this.getUsage() + "` - " + Translation.translate("commands.help." + this.getName()))
            .setColor(Config.getColor("WARNING"));

        channel.send(embed);
    }

    sendError(channel, reason, ... additional) {
        if (additional == undefined)
            additional = "";

        const embed = new Discord.RichEmbed()
            .setTitle("❗ | " + Translation.translate("command.error"))
            .setDescription(Translation.translate(reason, ... additional))
            .setColor(Config.getColor("FAIL"));

        channel.send(embed);
    }

    call(args, message) {
        throw new Error("You have to implement the method call!");
    }

}

module.exports = Command;