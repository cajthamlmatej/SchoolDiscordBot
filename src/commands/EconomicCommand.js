const Command = require("./Command");
const Discord = require("discord.js");
const Translation = require("../Translation");
const Config = require("../Config");
const CommandBuilder = require("../CommandBuilder");

class EconomicCommand extends Command {

    getName() {
        return "economic";
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

    call(args, message) {
        const channel = message.channel;

        const builder = new CommandBuilder("economic", message.author, channel, [{
            "name": "gross_wage",
            "example": Translation.translate("builder.economic.gross_wage.example"),
            "validate": (content) => {
                if (isNaN(content))
                    return "command.economic.isnotanumber";
                else if (content < 9999)
                    return "command.economic.toolow";
                else
                    return true;
            }
        },
        {
            "name": "tax_discount",
            "example": Translation.translate("builder.economic.tax_discount.example"),
            "validate": (content) => {
                if (isNaN(content))
                    return "command.economic.isnotanumber";
                else
                    return true;
            }
        }
        ], (values) => {
            const supergrossWageRounded = Math.ceil((values["gross_wage"] * 1.338) / 100) * 100;
            const supergrossWage = ((values["gross_wage"] * 1.338) / 100) * 100;
            let taxFromIncome = supergrossWageRounded * 0.15 - values["tax_discount"] - 2070;
            if (taxFromIncome < 0) taxFromIncome = 0;
            const socialAndHealtInsurance = values["gross_wage"] * 0.11;
            const netWage = values["gross_wage"] - taxFromIncome - socialAndHealtInsurance;

            channel.bulkDelete(1);

            const embed = new Discord.RichEmbed()
                .setTitle("💸 | " + Translation.translate("command.economic.title"))
                .setColor(Config.getColor("SUCCESS"))
                .addField(Translation.translate("command.economic.gross_wage"), values["gross_wage"])
                .addField(Translation.translate("command.economic.social_and_health_insurance"), socialAndHealtInsurance)
                .addField(Translation.translate("command.economic.supergross_wage"), supergrossWage + " ≐ " + supergrossWageRounded)
                .addField(Translation.translate("command.economic.tax_from_icome"), taxFromIncome)
                .addField(Translation.translate("command.economic.net_wage"), netWage)
                .setFooter(message.member.displayName, message.author.avatarURL);

            message.channel.send(embed);
        });

        builder.start();
        return true;
    }
}

module.exports = EconomicCommand;