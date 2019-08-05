const Command = require("./Command");
const Discord = require("discord.js");
const Translation = require("../Translation");
const Weather = require("weather-js");
const Config = require("../Config");

class WeatherCommand extends Command {

    getName() {
        return "weather";
    }

    getGroup() {
        return "utilities";
    }

    getRoles() {
        return ["member"];
    }

    init(bot) {
        this.client = bot.client;
        this.unit = Config.get("commands.weather.degree");
    }

    call(args, message) {
        const searchLocation = args.join(" ");
        Weather.find({ search: searchLocation, degreeType: this.unit }, (err, result) => {
            if (result[0] != undefined) {
                const resultBase = result[0];
                const resultForToday = resultBase.forecast[1];
                const resultForTomorrow = resultBase.forecast[2];
                const currentLocation = resultBase.location.name;
                const degree = " °" + this.unit;
                const resultTodaySkytext = resultBase.current.skytext.toLowerCase().replace(/ /g, "-");
                const resultTomorrowSkytext = resultForTomorrow.skytextday.toLowerCase().replace(/ /g, "-");

                const weatherEmbedToday = new Discord.RichEmbed()
                    .setColor(Config.getColor("SUCCESS"))
                    .setTitle(Translation.translate("command.weather.currentdate", currentLocation))
                    .setThumbnail(resultBase.current.imageUrl)
                    .addField(Translation.translate("command.weather.temperature"), resultBase.current.temperature + degree + " (" + "⬇️ " + resultForToday.low + degree + " | ⬆️ " + resultForToday.high + degree + ")", true)
                    .addField(Translation.translate("command.weather.condition"), Translation.translate("command.weather.skytext." + resultTodaySkytext), true)
                    .addField(Translation.translate("command.weather.humidity"), resultBase.current.humidity + "%", true)
                    .addField(Translation.translate("command.weather.wind"), resultBase.current.windspeed, true)
                    .addField(Translation.translate("command.weather.feelslike"), resultBase.current.feelslike + degree, true)
                    .addField(Translation.translate("command.weather.precipitation"), resultForToday.precip + "%", true)
                    .addField(Translation.translate("command.weather.lastchecked"), resultBase.current.observationtime, true)
                    .setTimestamp()
                    .setFooter(Translation.translate("command.weather.request", message.member.nickname), message.author.avatarURL);

                const weatherEmbedTomorrow = new Discord.RichEmbed()
                    .setColor(Config.getColor("SUCCESS"))
                    .setTitle(Translation.translate("command.weather.tomorrow", currentLocation), true)
                    .addField(Translation.translate("command.weather.temperature"), "⬇️ " + resultForTomorrow.low + degree + " | ⬆️ " + resultForTomorrow.high + degree, true)
                    .addField(Translation.translate("command.weather.condition"), Translation.translate("command.weather.skytext." + resultTomorrowSkytext), true)
                    .addField(Translation.translate("command.weather.precipitation"), resultForTomorrow.precip + "%", true)
                    .setTimestamp()
                    .setFooter(Translation.translate("command.weather.request", message.member.nickname), message.author.avatarURL);

                message.channel.send(weatherEmbedToday);
                message.channel.send(weatherEmbedTomorrow);

            } else
                message.channel.send("🛑 | " + Translation.translate("command.weather.error", searchLocation));
        });
    }
}

module.exports = WeatherCommand;