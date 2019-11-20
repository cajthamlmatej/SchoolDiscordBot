const Command = require("./Command");
const Discord = require("discord.js");
const CommandBuilder = require("../CommandBuilder");
const Translation = require("../Translation");
const Config = require("../Config");
const logger = require("../Logger");

class SendDmCommand extends Command {

    getName() {
        return "senddm";
    }

    getGroup() {
        return "manage";
    }

    getAliases() {
        return ["dm"];
    }

    getRoles() {
        return ["moderator"];
    }

    init(bot) {
        this.eventModule = bot.modules.eventmodule;
    }

    call(args, message) {
        const channel = message.channel;

        const builder = new CommandBuilder("senddm", message.author, channel, [{
            "name": "title",
            "example": Translation.translate("builder.senddm.title.example"),
            "validate": (content) => {
                return true;
            }
        },
        {
            "name": "role",
            "example": this.eventModule.getMentionableRoles(),
            "validate": (content) => {
                if (!this.eventModule.isMentionableRole(content))
                    return ["command.event.role-not-valid", this.eventModule.getMentionableRoles().join(", ")];
                else
                    return true;
            }
        },
        {
            "name": "message",
            "example": Translation.translate("builder.senddm.message.example"),
            "validate": (content) => {
                return true;
            }
        }

        ], (values) => {
            logger.info("User " + message.member.displayName + " sent dms to " + values["role"] + ". Content of message is \"" + values["message"] + "\"");

            const dmembed = new Discord.RichEmbed()
                .setTitle("🧬 | " + values["title"])
                .setColor(Config.getColor("SUCCESS"))
                .setDescription(values["message"])
                .setFooter(message.member.displayName, message.author.avatarURL);

            message.channel.guild.members.forEach((member) => {
                if (member.roles.has(this.eventModule.getMentionableRolesIds()[values["role"]]))
                    member.createDM().then(dm => dm.send(dmembed));
            });
        });

        builder.start();
        return true;
    }
}
module.exports = SendDmCommand;