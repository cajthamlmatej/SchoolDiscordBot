const Command = require("./Command");
const Discord = require("discord.js");
const { create, all } = require("mathjs");
const Translation = require("../Translation");
const math = create(all, {});

class MathCommand extends Command {

    getName() {
        return "math";
    }

    getGroup() {
        return "utilities";
    }

    getRoles() {
        return ["member"];
    }

    init(bot) {
        this.client = bot.client;
    }

    init(bot) {}

    call(args, message) {
        const messageArgs = args.join(" ").toLowerCase();
        if (messageArgs.includes("0/0")) {
            message.channel.send(Translation.translate("command.math.zerodividedbyzero.request"));
            return;
        }

        try {
            const question = math.evaluate(messageArgs);

            if (question != undefined && question != messageArgs && !(question instanceof Function) && !messageArgs.includes("\"")) {
                const successEmbed = new Discord.RichEmbed()
                    .setColor(0xbadc58)
                    .setTitle("🤓 | " + Translation.translate("command.math.result"))
                    .setDescription(question)
                    .setTimestamp()
                    .setFooter(Translation.translate("command.math.request") + ((message.member.nickname != null) ? message.member.nickname : message.member.user.username), message.author.avatarURL);

                message.channel.send(successEmbed);
            }


        } catch {
            const failEmbed = new Discord.RichEmbed()
                .setColor(0xc72227)
                .setTitle("😶 | " + Translation.translate("command.math.error"))
                .setDescription(Translation.translate("command.math.description.error") + messageArgs)
                .setTimestamp()
                .setFooter(Translation.translate("command.math.request") + ((message.member.nickname != null) ? message.member.nickname : message.member.user.username), message.author.avatarURL);

            message.channel.send(failEmbed);
        }

    }
}

module.exports = MathCommand;