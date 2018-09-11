const Module = require("./Module");
const Discord = require('discord.js');
const Translation = require("../Translation");
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

        Object.keys(events).forEach(name => {
            let data = events[name];
            let messageId = data["message"];
            let end = data.values.end;
            let todayDate = moment();
            let eventDate = moment(end, "D. M. YYYY");

            if(todayDate.diff(eventDate, "days") > this.daysToArchive){
                this.channel.fetchMessage(messageId).then(message => {
                    let embed = new Discord.RichEmbed(message.embeds[0]);

                    this.archiveChannel.send(embed);
                    message.delete();
                }).catch(error => {
                    
                });

                this.removeEventFromFile(name);
            }
        });
    }

    addEvent(name, type, start, end, role, place, subject, description, attachments){
        let values = {
            type: type,
            start: start,
            end: end,
            role: role,
            place: place,
            subject: subject,
            description: description
        };
        
        this.channel.send({
            embed: this.generateEmbed(values),
            files: attachments
        }).then(message => {
            this.addEventToFile(message.id, name, values);
        });
    }

    editEvent(name, type, value) {
        let events = fs.readFileSync(this.tempFile, "utf8");
        let eventsObject = JSON.parse(events);

        let event = eventsObject["events"][name];
        let values = event.values;
        values[type] = value;

        event.values = values;
        
        eventsObject["events"][name] = event;
        fs.writeFileSync(this.tempFile, JSON.stringify(eventsObject));

        this.channel.fetchMessage(event.message).then(message => {
            message.edit({
                embed: this.generateEmbed(values)
            });
        });
    }

    generateEmbed(values){
        let embed = new Discord.RichEmbed()
            .setTitle("🕜 | " + ((values.type == "event") ? Translation.translate("module.event.new-event") : Translation.translate("module.event.new-task")))
            .setDescription(values.description)
            .setColor(0xbadc58);

        embed.addField(Translation.translate("module.event.group"), this.channel.guild.roles.find(r => r.id == this.roles[values.role]), true);
        embed.addField(Translation.translate("module.event.subject"), values.subject, true);
        
        embed.addField(values.start == values.end ? Translation.translate("module.event.date") : Translation.translate("module.event.from-date-to-date"), values.start == values.end ? values.end : (values.start + " " + Translation.translate("module.event.to") + " " + values.end), true);
        embed.addField("Place", values.place);

        return embed;
    }

    addEventToFile(messageId, name, values){
        let events = fs.readFileSync(this.tempFile, "utf8");
        let eventsObject = JSON.parse(events);

        eventsObject["events"][name] = { message: messageId, values: values };

        fs.writeFileSync(this.tempFile, JSON.stringify(eventsObject));
    }

    deleteEvent(name){
        let events = fs.readFileSync(this.tempFile, "utf8");
        let eventsObject = JSON.parse(events);

        this.channel.fetchMessage(eventsObject["events"][name].message).then(message => {
            message.delete();
        }).catch(error => {
            // Message not found, dont log anything
        });

        this.removeEventFromFile(name);
    }

    removeEventFromFile(event){
        let events = fs.readFileSync(this.tempFile, "utf8");
        let eventsObject = JSON.parse(events);

        delete eventsObject["events"][event];

        fs.writeFileSync(this.tempFile, JSON.stringify(eventsObject));
    }

    getEvents(){
        let events = fs.readFileSync(this.tempFile, "utf8");
        let eventsObject = JSON.parse(events);

        return eventsObject["events"];
    }

    isMentionableRole(roleName){
        return Object.keys(this.roles).includes(roleName);
    }

    exists(name){
        let events = fs.readFileSync(this.tempFile, "utf8");
        let eventsObject = JSON.parse(events);

        return eventsObject["events"][name] != undefined;
    }

    printEventList(user){
        let list = "";
        let events = this.getEvents();

        Object.keys(events).forEach(eventName => {
            list += "\n**" + eventName + "**";
        });

        if(list == "")
            list = Translation.translate("module.event.no-event-exists");
        else
            list += "\n";
        
        const embed = new Discord.RichEmbed()
            .setTitle("📆 | " + Translation.translate("module.event.list"))
            .setDescription(list)
            .setColor(0xbadc58)
        
        user.createDM().then(dm => dm.send(embed)).catch(console.error);
    }


    event(name, args){
    }

}

module.exports = EventModule;