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
        let resultfortoday = result[0];
        let resultfortommorow = result[0].forecast[2];
        let currentlocation = result[0].location.name;
        let degree = " °" + this.unit;
        if(result[0] != undefined)
        {
            const weatherEmbedToday = new Discord.RichEmbed()
                .setColor(0xbadc58)
	            .setTitle(Translation.translate("command.weather.currentdate") + currentlocation)
	            .setThumbnail(resultfortoday.current.imageUrl)
                .addField(Translation.translate("command.weather.temperature"), resultfortoday.current.temperature + degree, true)
                .addField(Translation.translate("command.weather.condition"), resultfortoday.current.skytext, true)
	            .addField(Translation.translate("command.weather.humidity"), resultfortoday.current.humidity + "%", true)
	            .addField(Translation.translate("command.weather.wind"), resultfortoday.current.windspeed, true)
                .addField(Translation.translate("command.weather.feelslike"), resultfortoday.current.feelslike + degree, true)
                .addField(Translation.translate("command.weather.lastchecked"), resultfortoday.current.observationtime, true)
	            .setTimestamp()
	            .setFooter(Translation.translate("command.weather.request") + message.author.name, message.author.avatarURL);

            const weatherEmbedTomorrow = new Discord.RichEmbed()
	            .setColor(0xbadc58)
	            .setTitle(Translation.translate("command.weather.tommorow") +  currentlocation, true)
                .addField(Translation.translate("command.weather.temperature"), "⬆️ " + resultfortommorow .low + degree  + " | ⬇️ " +  resultfortommorow .high + degree, true)
                .addField(Translation.translate("command.weather.condition"),resultfortommorow .skytextday,true)
                .addField(Translation.translate("command.weather.precipitation"),resultfortommorow .precip + "%",true)
	            .setTimestamp()
                .setFooter(Translation.translate("command.weather.request") + message.author.name, message.author.avatarURL);

            message.channel.send(weatherEmbedToday);
            message.channel.send(weatherEmbedTomorrow);
        }
        else{
            message.channel.send(Translation.translate("🛑 | " + "command.weather.error"));
        }
    });
    }
}

module.exports = WeatherCommand;