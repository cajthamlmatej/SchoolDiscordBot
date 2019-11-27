const Module = require("./Module");
const Discord = require("discord.js");
const Translation = require("../Translation");
const Config = require("../Config");
const moment = require("moment");
const logger = require("../Logger");

const eventRepository = require("../database/Database").getRepository("event");

class EventModule extends Module {

    getName() {
        return "eventmodule";
    }

    async init(bot) {
        this.channel = bot.client.channels.find(channel => channel.id === Config.get("channels.event"));
        this.archiveChannel = bot.client.channels.find(channel => channel.id === Config.get("channels.event-archive"));
        this.roles = Config.get("roles.mentionable");
        this.daysToArchive = Config.get("modules.event.archive-days");
        this.timetableModule = bot.modules.eventtimetablemodule;

        this.tick();
        this.interval = setInterval(() => this.tick(), Config.get("modules.event.check-time"));
    }

    uninit() {
        clearTimeout(this.interval);
    }

    async tick() {
        const events = await this.getEvents();

        events.forEach(async(event) => {
            const messageId = event.message;
            const end = event.end;
            const todayDate = moment();
            const eventDate = moment(end, "D. M. YYYY");

            if (todayDate.diff(eventDate, "days") >= this.daysToArchive)
                this.channel.fetchMessage(messageId).then(message => {
                    const embed = new Discord.RichEmbed(message.embeds[0]);

                    this.archiveChannel.send(embed);
                    message.delete().then(async() => {
                        await eventRepository.archiveEvent(event.name);
                    });
                }).catch(async(error) => {
                    logger.error("Message with id " + event.message + " not found for event with name " + event.name + ". Assuming that message is deleted. Archiving event.");

                    await eventRepository.archiveEvent(event.name);
                });

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
        }).then(async(message) => {
            values.message = message.id;

            await eventRepository.insert(values);

            if (this.timetableModule != undefined)
                this.timetableModule.update();
        });
    }

    async editEvent(name, type, value, author) {
        const event = await eventRepository.getEventByName(name);

        if (type != "refresh") {
            event.history.push({ type: type, value: { old: event[type], new: value }, author: author });

            event[type] = value;

            if (type == "start" || type == "end" && event["end"] == event["start"]) {
                event["end"] = value;
                event["start"] = value;
            }
        }

        await event.save();

        this.channel.fetchMessage(event.message).then(message => {
            this.channel.guild.fetchMember(event.author).then(author => {
                message.edit({
                    embed: this.generateEmbed(event, author)
                });

                if (["title", "start", "end", "role", "subject"].includes(type) && this.timetableModule != undefined)
                    this.timetableModule.update();
            });
        });
    }

    async unarchiveEvent(name, start, end) {
        const event = await eventRepository.getArchivedEventByName(name);
        event[start] = start;
        event[end] = end;
        await eventRepository.unarchiveEvent(name);

        this.channel.guild.fetchMember(event.author).then(author => {
            event.history.push({ type: "archived", value: { old: "archived", new: "unarchived" }, author: author.id });
            this.channel.send(this.generateEmbed(event, author))
                .then(async(msg) => {
                    event.message = msg.id;
                    await event.save();
                });
        });
    }

    generateEmbed(event, author) {
        const embed = new Discord.RichEmbed()
            .setTitle("🕜 | " + ((event.type == "event") ? Translation.translate("module.event.new-event") : Translation.translate("module.event.new-task")) + " | " + event.title)
            .setDescription(event.description)
            .setColor(Config.getColor("SUCCESS"));

        embed.addField(Translation.translate("module.event.group"), this.channel.guild.roles.find(r => r.id == this.roles[event.role]), true);
        embed.addField(Translation.translate("module.event.subject"), event.subject, true);

        let dateTitle = "";
        let date = "";

        if (event.start == event.end) {
            dateTitle = Translation.translate("module.event.date");
            date = moment(event.start, "D. M. YYYY").format("D. M. YYYY");
        } else {
            dateTitle = Translation.translate("module.event.from-date-to-date");
            date = moment(event.start, "D. M. YYYY HH:mm").format("D. M. YYYY HH:mm") + " " + Translation.translate("module.event.to") + " " + moment(event.end, "D. M. YYYY HH:mm").format("D. M. YYYY HH:mm");
        }

        embed.addField(dateTitle, date, true);
        embed.addField(Translation.translate("module.event.place"), event.place);
        embed.addField(Translation.translate("module.event.calendar.calendar"), this.generateGoogleCalendarLink(event));

        embed.setFooter(author.displayName, author.user.avatarURL);

        return embed;
    }

    generateGoogleCalendarLink(event) {
        const startDate = moment(event.start, ["D. M. YYYY HH:mm", "D. M. YYYY"]);
        const endDate = moment(event.end, ["D. M. YYYY HH:mm", "D. M. YYYY"]);

        if (startDate.format("D. M. YYYY HH:mm") == endDate.format("D. M. YYYY HH:mm"))
            endDate.add(1, "d");

        let startDateFormat = "YMMDD[T]HHmm[00]";
        let endDateFormat = "YMMDD[T]HHmm[00]";

        if (startDate.hour() == 0 && startDate.minute() == 0)
            startDateFormat = "YMMDD";

        if (endDate.hour() == 0 && endDate.minute() == 0)
            endDateFormat = "YMMDD";

        const text = "[" + Translation.translate("module.event.calendar.add-to-calendar") + "]";

        let link = "(https://www.google.com/calendar/event?action=TEMPLATE";

        link += "&text=" + encodeURIComponent(event.subject + " | " + event.title.replace(/[*_`\\/~]/g, ""));
        link += "&details=" + encodeURIComponent(Translation.translate("module.event.calendar.details"));
        link += "&location=" + encodeURIComponent(event.place);
        link += "&dates=" + encodeURI(startDate.format(startDateFormat) + "/" + endDate.format(endDateFormat));

        link += ")";

        return text + link;
    }

    async deleteEvent(name) {
        const event = await eventRepository.getEventByName(name);

        this.channel.fetchMessage(event.message).then(message => {
            message.delete();
        }).catch(error => {
            logger.error("Message with id " + event.message + " not found for event with name " + name + ". Assuming that message is deleted. Deleting event.");
        });

        await eventRepository.deleteEvent(name);

        if (this.timetableModule != undefined)
            this.timetableModule.update();
    }

    async getEvents(archived = false, fields = null) {
        return await eventRepository.getEvents(archived, fields);
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
        return await eventRepository.doesEventExistsWithName(name);
    }

    async archiveExists(name) {
        return await eventRepository.doesArchivedEventExistsWithName(name);
    }

    async printEventList(user) {
        let list = "";
        const events = await this.getEvents(false, "name title");

        events.forEach(event => {
            list += "\n**" + event.name + " (" + event.title + ")**";
        });

        if (list == "")
            list = Translation.translate("module.event.no-event-exists");
        else
            list += "\n";

        const embed = new Discord.RichEmbed()
            .setTitle("📆 | " + Translation.translate("module.event.list"))
            .setDescription(list)
            .setColor(Config.getColor("SUCCESS"));

        user.createDM().then(dm => dm.send(embed)).catch(logger.error);
    }

    async printArchivedList(user) {
        let list = "";
        const events = await eventRepository.getEvents(true, "name title");

        events.forEach(event => {
            list += "\n**" + event.name + " (" + event.title + ")**";
        });

        if (list == "")
            list = Translation.translate("module.event.no-event-exists");
        else
            list += "\n";

        const embed = new Discord.RichEmbed()
            .setTitle("📆 | " + Translation.translate("module.event.archivedlist"))
            .setDescription(list)
            .setColor(Config.getColor("SUCCESS"));

        user.createDM().then(dm => dm.send(embed)).catch(logger.error);
    }

    async getEventThatStartsInEnteredDay(dateMoment) {
        return await eventRepository.getEventsThatStartAtDay(dateMoment.format("D. M. YYYY"));
    }

    async getEventThatEndsInEnteredDay(dateMoment) {
        return await eventRepository.getEventsThatEndAtDay(dateMoment.format("D. M. YYYY"));
    }

    async getEventThatGoingInEnteredDay(dateMoment) {
        return await eventRepository.getEventsThatGoingAtDay(dateMoment.format("D. M. YYYY"));
    }

    async getEventNames() {
        return await eventRepository.getEventsNames();
    }

    async getEvent(name, archived = false) {
        return await eventRepository.getEventByName(name, archived);
    }

    event(name, args) {}

}

module.exports = EventModule;