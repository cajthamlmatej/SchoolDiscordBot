const Module = require("./Module");
const Discord = require("discord.js");
const Translation = require("../Translation");
const fs = require("fs");
const moment = require("moment");

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
        setInterval(() => this.tick(), bot.settings.modules.event.refresh);
    }

    tick() {
        const events = this.getEvents();
        const toRemove = [];

        Object.keys(events).forEach(name => {
            const data = events[name];
            const messageId = data.message;
            const end = data.values.end;
            const todayDate = moment();
            const eventDate = moment(end, "D. M. YYYY");

            if (todayDate.diff(eventDate, "days") >= this.daysToArchive) {
                this.channel.fetchMessage(messageId).then(message => {
                    const embed = new Discord.RichEmbed(message.embeds[0]);

                    this.archiveChannel.send(embed);
                    message.delete();
                }).catch(error => {

                });

                this.removeEventFromFile(name);
            }
        });
    }

    addEvent(name, type, start, end, role, place, subject, description, author, attachments) {
        const values = {
            type: type,
            start: start,
            end: end,
            role: role,
            place: place,
            subject: subject,
            description: description,
            author: author.id
        };

        this.channel.send({
            embed: this.generateEmbed(values, author),
            files: attachments
        }).then(message => {
            this.addEventToFile(message.id, name, values);
        });
    }

    editEvent(name, type, value) {
        const events = fs.readFileSync(this.tempFile, "utf8");
        const eventsObject = JSON.parse(events);

        const event = eventsObject["events"][name];
        const values = event.values;

        if(type != "name") {
            values[type] = value;

            if(type == "start" || type == "end" && values["end"] == values["start"]) {
                values["end"] = value;
                values["start"] = value;
            }

            event.values = values;
            eventsObject["events"][name] = event;
        } else {
            delete eventsObject["events"][name];
            eventsObject["events"][value] = event;
        } 

        fs.writeFileSync(this.tempFile, JSON.stringify(eventsObject));

        this.channel.fetchMessage(event.message).then(message => {
            if(values["author"] == undefined) 
                values["author"] = "164388362369761281"; // cant happend when creating new events, currently some dont have value author.
            
            this.channel.guild.fetchMember(values["author"]).then(author => {
                message.edit({
                    embed: this.generateEmbed(values, author)
                });
            });
        });
    }

    generateEmbed(values, author) {
        const embed = new Discord.RichEmbed()
            .setTitle("🕜 | " + ((values.type == "event") ? Translation.translate("module.event.new-event") : Translation.translate("module.event.new-task")))
            .setDescription(values.description)
            .setColor(0xbadc58);

        embed.addField(Translation.translate("module.event.group"), this.channel.guild.roles.find(r => r.id == this.roles[values.role]), true);
        embed.addField(Translation.translate("module.event.subject"), values.subject, true);

        let dateTitle = "";
        let date = "";

        if (values.start == values.end) {
            dateTitle = Translation.translate("module.event.date");
            date = values.start;
        } else {
            dateTitle = Translation.translate("module.event.from-date-to-date");
            date = values.start + " " + Translation.translate("module.event.to") + " " + values.end;
        }

        embed.addField(dateTitle, date, true);
        embed.addField(Translation.translate("module.event.place"), values.place);
        embed.addField("Kalendář", "[Přidat do kalendáře](https://www.google.com/calendar/event?action=TEMPLATE"
                                        + "&text=" + encodeURI(values.subject + " | " + ((values.type == "event") ? "Událost" : "Úkol"))
                                        + "&details=" + encodeURI("Všechny potřebné informace naleznete na Discordu.") 
                                        + "&location=" + encodeURI(values.place)
                                        + "&dates=" + encodeURI(
                                                moment(values.start, "D. M. YYYY").format("YMMDD")
                                                + "/" 
                                                + moment(values.end, "D. M. YYYY").format("YMMDD") + ")"));
        embed.setFooter(author.nickname, author.user.avatarURL);

        return embed;
    }

    addEventToFile(messageId, name, values) {
        const events = fs.readFileSync(this.tempFile, "utf8");
        const eventsObject = JSON.parse(events);

        eventsObject["events"][name] = { message: messageId, values: values };

        fs.writeFileSync(this.tempFile, JSON.stringify(eventsObject));
    }

    deleteEvent(name) {
        const events = fs.readFileSync(this.tempFile, "utf8");
        const eventsObject = JSON.parse(events);

        this.channel.fetchMessage(eventsObject["events"][name].message).then(message => {
            message.delete();
        }).catch(error => {
            // Message not found, dont log anything
        });

        this.removeEventFromFile(name);
    }

    removeEventFromFile(event) {
        const events = fs.readFileSync(this.tempFile, "utf8");
        const eventsObject = JSON.parse(events);

        delete eventsObject["events"][event];

        fs.writeFileSync(this.tempFile, JSON.stringify(eventsObject));
    }

    getEvents() {
        const events = fs.readFileSync(this.tempFile, "utf8");
        const eventsObject = JSON.parse(events);

        return eventsObject["events"];
    }

    isMentionableRole(roleName) {
        return Object.keys(this.roles).includes(roleName);
    }

    getMentionableRoles() {
        return Object.keys(this.roles);
    }

    getMentionableRolesIds() {
        return this.roles;
    }

    exists(name) {
        const events = fs.readFileSync(this.tempFile, "utf8");
        const eventsObject = JSON.parse(events);

        return eventsObject["events"][name] != undefined;
    }

    printEventList(user) {
        let list = "";
        const events = this.getEvents();

        Object.keys(events).forEach(eventName => {
            list += "\n**" + eventName + "**";
        });

        if (list == "")
            list = Translation.translate("module.event.no-event-exists");
        else
            list += "\n";

        const embed = new Discord.RichEmbed()
            .setTitle("📆 | " + Translation.translate("module.event.list"))
            .setDescription(list)
            .setColor(0xbadc58);

        user.createDM().then(dm => dm.send(embed)).catch(console.error);
    }

    getEventThatStartsInEnteredDay(dateMoment) {
        const startsEvents = [];

        const events = this.getEvents();
        Object.keys(events).forEach(eventName => {
            const event = events[eventName];
            const eventValues = event.values;

            let dateStart = moment(eventValues.start, "D. M. YYYY");
            if (!dateStart.isValid()) 
                dateStart = moment(eventValues.start, "D. M. YYYY HH:mm");

            if (!(dateMoment.date() == dateStart.date() && dateMoment.month() == dateStart.month() && dateMoment.year() == dateStart.year()))
                return;

            if(eventValues.end == eventValues.start)
                return;
            
            eventValues["name"] = eventName;

            startsEvents.push(eventValues);
        });

        return startsEvents;
    }

    getEventThatEndsInEnteredDay(dateMoment) {
        const endsEvents = [];

        const events = this.getEvents();
        Object.keys(events).forEach(eventName => {
            const event = events[eventName];
            const eventValues = event.values;

            let dateEnd = moment(eventValues.end, "D. M. YYYY");
            if (!dateEnd.isValid()) 
                dateEnd = moment(eventValues.end, "D. M. YYYY HH:mm");

            if (!(dateMoment.date() == dateEnd.date() && dateMoment.month() == dateEnd.month() && dateMoment.year() == dateEnd.year()))
                return;

            if(eventValues.end == eventValues.start)
                return;
            
            eventValues["name"] = eventName;

            endsEvents.push(eventValues);
        });

        return endsEvents;
    }

    getEventThatGoingInEnteredDay(dateMoment) {
        const goingEvents = [];

        const events = this.getEvents();
        Object.keys(events).forEach(eventName => {
            const event = events[eventName];
            const eventValues = event.values;

            let dateStart = moment(eventValues.start, "D. M. YYYY");
            if (!dateStart.isValid()) 
                dateStart = moment(eventValues.start, "D. M. YYYY HH:mm");

            if (!(dateMoment.date() == dateStart.date() && dateMoment.month() == dateStart.month() && dateMoment.year() == dateStart.year()))
                return;

            if(eventValues.end != eventValues.start)
                return;
            
            eventValues["name"] = eventName;

            goingEvents.push(eventValues);
        });

        return goingEvents;
        
    }

    getEventNames() {
        const events = fs.readFileSync(this.tempFile, "utf8");
        const eventsObject = JSON.parse(events)["events"];
    
        const eventNames = [];

        Object.keys(eventsObject).forEach(eventName => {
            eventNames.push(eventName); 
        });

        return eventNames;
    }

    event(name, args) {
    }

}

module.exports = EventModule;