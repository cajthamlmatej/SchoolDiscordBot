const Command = require("./Command");
const Discord = require('discord.js');
const Translation = require("../Translation");
const Weather = require('weather-js');

class WeatherCommand extends Command {

    getName() {
        return "weather";
    }

    getGroup() {
        return "main";
    }

    getRoles() {
        return ["member"];
    }

    init(bot) {
        this.client = bot.client;
        this.unit = bot.settings.modules.weather.degreeUnit;
    }

    call(args, message) {
        Weather.find({search: args.join(' '), degreeType: this.unit}, (err, result) => {
            let resultForToday  = result[0];
            let resultForTommorow = resultForToday.forecast[2];
            let currentLocation = resultForToday.location.name;
            let degree = " °" + this.unit;
            if (resultForToday  != undefined)
            {
                const weatherEmbedToday = new Discord.RichEmbed()
                    .setColor(0xbadc58)
                    .setTitle(Translation.translate("command.weather.currentdate") + currentLocation)
                    .setThumbnail(resultForToday.current.imageUrl)
                    .addField(Translation.translate("command.weather.temperature"), resultForToday.current.temperature + degree, true)
                    .addField(Translation.translate("command.weather.condition"), resultForToday.current.skytext, true)
                    .addField(Translation.translate("command.weather.humidity"), resultForToday.current.humidity + "%", true)
                    .addField(Translation.translate("command.weather.wind"), resultForToday.current.windspeed, true)
                    .addField(Translation.translate("command.weather.feelslike"), resultForToday.current.feelslike + degree, true)
                    .addField(Translation.translate("command.weather.lastchecked"), resultForToday.current.observationtime, true)
                    .setTimestamp()
                    .setFooter(Translation.translate("command.weather.request") + message.author.name, message.author.avatarURL);

                const weatherEmbedTomorrow = new Discord.RichEmbed()
                    .setColor(0xbadc58)
                    .setTitle(Translation.translate("command.weather.tommorow") + currentLocation, true)
                    .addField(Translation.translate("command.weather.temperature"), "⬆️ " + resultForTommorow.low + degree  + " | ⬇️ " + resultForTommorow.high + degree, true)
                    .addField(Translation.translate("command.weather.condition"), resultForTommorow.skytextday,true)
                    .addField(Translation.translate("command.weather.precipitation"), resultForTommorow.precip + "%",true)
                    .setTimestamp()
                    .setFooter(Translation.translate("command.weather.request") + message.author.name, message.author.avatarURL);

                message.channel.send(weatherEmbedToday);
                message.channel.send(weatherEmbedTomorrow);
            }
            else {
                message.channel.send(Translation.translate("🛑 | " + "command.weather.error"));
            }
        });
    }
}

module.exports = WeatherCommand;