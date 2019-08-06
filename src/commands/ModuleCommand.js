const SubsCommand = require("./SubsCommand");
const Discord = require("discord.js");
const Config = require("../Config");
const Translation = require("../Translation");

class ModuleCommand extends SubsCommand {

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
        return "module";
    }

    getGroup() {
        return "manage";
    }

    init(bot) {
        this.bot = bot;
    }

    callList(args, message) {
        let modules = "";

        Object.keys(this.bot.modules).forEach(moduleName => {
            modules += "**" + moduleName + "**\n";
        });

        message.channel.send(new Discord.RichEmbed()
            .setTitle("⚙️ | " + Translation.translate("command.command.list"))
            .setDescription(modules)
            .setColor(Config.getColor("SUCCESS")));
    }

    callDisable(args, message) {
        const moduleName = args[0];

        if(this.bot.modules[moduleName] == undefined) {
            this.sendError(message.channel, "command.module.module-not-found", moduleName);
            return;
        }
        
        this.bot.disableModule(moduleName);

        message.channel.send(new Discord.RichEmbed()
            .setTitle("⚙️ | " + Translation.translate("command.module.disabled.title"))
            .setDescription(Translation.translate("command.module.disabled.description"))
            .setColor(Config.getColor("SUCCESS")));
    }

}

module.exports = ModuleCommand;