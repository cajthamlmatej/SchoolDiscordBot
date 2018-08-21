const Module = require("./Module");
const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');

class EventModule extends Module {

    getName() {
        return "eventmodule";
    }

    init(client, settings, commands) {
        this.channel = client.channels.find(channel => channel.id === settings.channels["event"]);
        this.archiveChannel = client.channels.find(channel => channel.id === settings.channels["event-archive"]);


        this.tick();
        setInterval(() => this.tick(), 1800000);
    }

    tick(){
        let events = fs.readFileSync("./temp/events.json", "utf8");
        let eventsObject = JSON.parse(events);

        let toRemove = [];

        Object.keys(eventsObject["events"]).forEach(messageId => {
            let to = eventsObject["events"][messageId];
            let todayDate = moment();
            let eventDate = moment(to, "D. M. YYYY");

            console.log(todayDate.diff(eventDate, "days"));
            if(todayDate.diff(eventDate, "days") > 7){
                this.channel.fetchMessage(messageId)
                    .then(message => {
                        let embed = new Discord.RichEmbed(message.embeds[0]);

                        this.archiveChannel.send(embed);
                        message.delete();
                        toRemove.push(messageId);
                    }).catch(console.error);
            }
        });

        toRemove.forEach(remove => {
            delete eventsObject["events"][remove];
        });

        fs.writeFileSync("./temp/events.json", JSON.stringify(eventsObject));
    }

    event(name, args){
    }

}

module.exports = EventModule;