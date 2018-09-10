const Module = require("./Module");
const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');

class EventModule extends Module {

    getName() {
        return "eventmodule";
    }

    init(bot) {
        this.channel = bot.client.channels.find(channel => channel.id === bot.settings.channels.event);
        this.archiveChannel = bot.client.channels.find(channel => channel.id === bot.settings.channels["event-archive"]);
        this.roles = bot.settings.roles.mentionable;
        this.daysToArchive = bot.settings.modules.event.days;

        this.tempFile = "./temp/events.json";

        this.tick();
        setInterval(() => this.tick(), 1800000);
    }

    tick(){
        let events = this.getEvents(); 
        let toRemove = [];

        Object.keys(events).forEach(messageId => {
            let to = events[messageId];
            let todayDate = moment();
            let eventDate = moment(to, "D. M. YYYY");

            if(todayDate.diff(eventDate, "days") > this.daysToArchive){
                this.channel.fetchMessage(messageId).then(message => {
                    let embed = new Discord.RichEmbed(message.embeds[0]);

                    this.archiveChannel.send(embed);
                    message.delete();
                    toRemove.push(messageId);
                }).catch(error => {
                    // not found, dont do anything
                });
            }
        });

        this.removeEventsFromFile(toRemove);
    }

    addEvent(type, from, to, role, place, subject, description, attachments){
        let embed = new Discord.RichEmbed()
            .setTitle("🕜 | " + ((type == "udalost") ? "Nová událost" : "Nový úkol"))
            .setDescription(description)
            .setColor(0xbadc58);

        embed.addField("Skupina", this.channel.guild.roles.find(r => r.id == this.roles[role]), true);
        embed.addField("Předmět", subject == "all" ? "?" : subject, true);
        
        embed.addField(from == to ? "Datum" : "Od kdy do kdy", from == to ? to : (from + " do " + to), true);
        embed.addField("Místo", place == "all" ? "Škola" : place);
        
        this.channel.send({
            embed: embed,
            files: attachments
        }).then(message => {
            this.addEventToFile(message.id, to);
        });
    }

    addEventToFile(messageId, toDate){
        let events = fs.readFileSync(this.tempFile, "utf8");
        let eventsObject = JSON.parse(events);

        eventsObject["events"][messageId] = toDate;

        fs.writeFileSync(this.tempFile, JSON.stringify(eventsObject));
    }

    removeEventsFromFile(es){
        let events = fs.readFileSync(this.tempFile, "utf8");
        let eventsObject = JSON.parse(events);

        es.forEach(event => {
            delete eventsObject["events"][event];
        });

        fs.writeFileSync(this.tempFile, JSON.stringify(eventsObject));
    }

    getEvents(){
        let events = fs.readFileSync(this.tempFile, "utf8");
        let eventsObject = JSON.parse(events);

        return eventsObject["events"];
    }

    event(name, args){
    }

}

module.exports = EventModule;