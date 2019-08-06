const SubsCommand = require("./SubsCommand");
const Discord = require("discord.js");
const Config = require("../Config");
const Translation = require("../Translation");

class CommandCommand extends SubsCommand {

    getSubCommands() {
        return {
            "disable": {
                "arguments": 1,
                "roles": ["admin"]
            },
            "list": {
                "arguments": 0,
                "roles": ["admin"]
            }
        };
    }

    getName() {
        return "command";
    }

    getGroup() {
        return "manage";
    }

    init(bot) {
        this.bot = bot;
    }

    callList(args, message) {
        let commands = "";

        Object.keys(this.bot.commands).forEach(command => {
            commands += "**" + command + "**\n";
        });

        message.channel.send(new Discord.RichEmbed()
            .setTitle("⚙️ | " + Translation.translate("command.command.list"))
            .setDescription(commands)
            .setColor(Config.getColor("SUCCESS")));
    }

    callDisable(args, message) {
        const command = args[0];

        if(this.bot.commands[command] == undefined) {
            this.sendError(message.channel, "command.command.command-not-found", command);
            return;
        }
        
        this.bot.disableCommand(command);

        message.channel.send(new Discord.RichEmbed()
            .setTitle("⚙️ | " + Translation.translate("command.command.disabled.description"))
            .setDescription(Translation.translate("command.command.disabled.title"))
            .setColor(Config.getColor("SUCCESS")));
    }

}

module.exports = CommandCommand;