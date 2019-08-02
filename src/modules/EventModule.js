const Module = require("./Module");
const Discord = require("discord.js");
const Translation = require("../Translation");
const Config = require("../Config");
const fs = require("fs");
const moment = require("moment");
const database = require("../database/Database");

class EventModule extends Module {

    getName() {
        return "eventmodule";
    }

    init(bot) {
        this.channel = bot.client.channels.find(channel => channel.id === Config.get("channels.event"));
        this.archiveChannel = bot.client.channels.find(channel => channel.id === Config.get("channels.event-archive"));
        this.roles = Config.get("roles.mentionable");
        this.daysToArchive = Config.get("modules.event.archive-days");

        this.tempFile = "./temp/events.json";

        this.tick();
        setInterval(() => this.tick(), Config.get("modules.event.check-time"));
    }

    tick() {
        const events = this.getEvents();

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

    addEvent(name, type, title, start, end, role, place, subject, description, author, attachments) {
        const values = {
            name: name,
            type: type,
            title: title,
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
            values.id = message.id;

            database.getRepository("event").insert(values);
            //this.addEventToFile(message.id, name, values);
        });
    }

    editEvent(name, type, value) {
        const events = fs.readFileSync(this.tempFile, "utf8");
        const eventsObject = JSON.parse(events);

        const event = eventsObject["events"][name];
        const values = event.values;

        if (type != "name") {
            values[type] = value;

            if (type == "start" || type == "end" && values["end"] == values["start"]) {
                values["end"] = value;
                values["start"] = value;
            }

            event.values = values;
            eventsObject["events"][name] = event;
        } else {
            if (type == "refresh")
                return;

            delete eventsObject["events"][name];
            eventsObject["events"][value] = event;
        }

        fs.writeFileSync(this.tempFile, JSON.stringify(eventsObject));

        this.channel.fetchMessage(event.message).then(message => {
            if (values["author"] == undefined)
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
            .setTitle("🕜 | " + ((values.type == "event") ? Translation.translate("module.event.new-event") : Translation.translate("module.event.new-task")) + " | " + values.title)
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

        const startDate = moment(values.start, "D. M. YYYY");
        const endDate = moment(values.end, "D. M. YYYY");

        if (startDate.format("D. M. YYYY HH:mm") == endDate.format("D. M. YYYY HH:mm"))
            endDate.add(1, "d");

        let startDateFormat = "YMMDD[T]HHmmS";
        let endDateFormat = "YMMDD[T]HHmmS";

        if (startDate.hour() == 0 && startDate.minute() == 0)
            startDateFormat = "YMMDD";

        if (endDate.hour() == 0 && endDate.minute() == 0)
            endDateFormat = "YMMDD";

        embed.addField(dateTitle, date, true);
        embed.addField(Translation.translate("module.event.place"), values.place);
        embed.addField(Translation.translate("module.event.calendar.calendar"), "[" + Translation.translate("module.event.calendar.add-to-calendar") + "](https://www.google.com/calendar/event?action=TEMPLATE" +
            "&text=" + encodeURIComponent(values.subject + " | " + ((values.type == "event") ? Translation.translate("module.event.calendar.event") : Translation.translate("module.event.calendar.task")) + " | " + values.title) +
            "&details=" + encodeURIComponent(Translation.translate("module.event.calendar.details")) +
            "&location=" + encodeURIComponent(values.place) +
            "&dates=" + encodeURI(startDate.format(startDateFormat) + "/" + endDate.format(endDateFormat) + ")"));

        embed.setFooter(author.nickname == undefined ? author.user.username : author.nickname, author.user.avatarURL);

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

    async exists(name) {
        return await database.getRepository("event").doesEventExistsWithName(name);

        const events = fs.readFileSync(this.tempFile, "utf8");
        const eventsObject = JSON.parse(events);

        return eventsObject["events"][name] != undefined;
    }

    printEventList(user) {
        let list = "";
        const events = this.getEvents();

        Object.keys(events).forEach(eventName => {
            list += "\n**" + eventName + " (" + events[eventName].values.title + ")**";
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

            if (eventValues.end == eventValues.start)
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

            if (eventValues.end == eventValues.start)
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

            if (eventValues.end != eventValues.start)
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

    event(name, args) {}

}

module.exports = EventModule;