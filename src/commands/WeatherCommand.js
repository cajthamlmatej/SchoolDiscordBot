const Command = require("./Command");
const Discord = require('discord.js');
const Translation = require("../Translation");
const weather = require('weather-js');

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
    }

    call(args, message) {
 
     weather.find({search: args.join(' '), degreeType: 'C'}, function(err, result) {
        if(result[0] != undefined)
        {
            const weatherEmbedToday = new Discord.RichEmbed()
	            .setColor('#BADC58')
	            .setTitle(Translation.translate("command.weather.currentdate")+ result[0].location.name)
	            .setThumbnail(result[0].current.imageUrl)
                .addField(Translation.translate("command.weather.temperature"), result[0].current.temperature+" °C", true)
                .addField(Translation.translate("command.weather.condition"), result[0].current.skytext, true)
	            .addField(Translation.translate("command.weather.humidity"), result[0].current.humidity+"%", true)
	            .addField(Translation.translate("command.weather.wind"), result[0].current.windspeed, true)
                .addField(Translation.translate("command.weather.feelslike"), result[0].current.feelslike+" °C", true)
                .addField(Translation.translate("command.weather.lastchecked"), result[0].current.observationtime, true)
	            .setTimestamp()
	            .setFooter(Translation.translate("command.weather.request") + message.author.name, message.author.avatarURL);

            const weatherEmbedTom = new Discord.RichEmbed()
	            .setColor('#BADC58')
	            .setTitle(Translation.translate("command.weather.tommorow")+ result[0].location.name,true)
                .addField(Translation.translate("command.weather.temperature"), "⬆️ " + result[0].forecast[2].low+" °C" +" | ⬇️ "+ result[0].forecast[2].high+" °C", true)
                .addField(Translation.translate("command.weather.condition"),result[0].forecast[2].skytextday,true)
                .addField(Translation.translate("command.weather.precipitation"),result[0].forecast[2].precip+"%",true)
	            .setTimestamp()
                .setFooter(Translation.translate("command.weather.request") + message.author.name, message.author.avatarURL);

            message.channel.send(weatherEmbedToday);
            message.channel.send(weatherEmbedTom);
            
        }
        else{
            message.channel.send(Translation.translate("command.weather.error"));
        }
    });

    }

}

module.exports = WeatherCommand;