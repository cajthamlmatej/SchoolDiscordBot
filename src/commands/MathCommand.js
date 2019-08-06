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

    }

    call(args, message) {
        const messageArgs = args.join(" ");
        if (messageArgs.includes("0/0")) {
            message.channel.send(Translation.translate("command.math.zerodividedbyzero.request"));
            return;
        }

        try {
            const question = math.evaluate(messageArgs);

            if (question != undefined && question != messageArgs && !(question instanceof Function) && !messageArgs.includes("\""))
                message.channel.send(new Discord.RichEmbed()
                    .setColor(0xbadc58)
                    .setTitle("🤓 | " + Translation.translate("command.math.result"))
                    .setDescription(question)
                    .setTimestamp()
                    .setFooter(Translation.translate("command.math.request", message.member.displayName), message.author.avatarURL));

        } catch (error) {
            message.channel.send(new Discord.RichEmbed()
                .setColor(0xc72227)
                .setTitle("😶 | " + Translation.translate("command.math.error"))
                .setDescription(Translation.translate("command.math.description.error", messageArgs))
                .setTimestamp()
                .setFooter(Translation.translate("command.math.request", message.member.displayName), message.author.avatarURL));
        }

    }
}

module.exports = MathCommand;