const Module = require("./Module");
const fs = require("fs");
const puppeteer = require('puppeteer');
const moment = require("moment");
const Config = require("../Config");
const Discord = require("discord.js");
const Translation = require("../Translation");

const eventRepository = require("../database/Database").getRepository("event");

class EventTimetableModule extends Module {

    getName() {
        return "eventtimetablemodule";
    }

    async init(bot) {
        this.channel = bot.client.channels.find(channel => channel.id === Config.get("channels.timetable"));
        this.eventModule = bot.modules.eventmodule;

        this.update();
    }

    async update() {
        if(this.eventModule == undefined)
            return;

        const channel = this.channel;
        channel.bulkDelete(50).catch(e => {});

        // Week
        await this.printWeek(channel);
        await this.printNextWeek(channel);
        // Timetable
        await this.printTimetable(channel);
    }

    async printTimetable(channel) {
        const events = await eventRepository.getAllEvents();
        const eventsDates = {};

        const mondayDay = moment();
        if(mondayDay.weekday() == "Saturday" || mondayDay.weekday() == "Sunday"){
            while (mondayDay.weekday() !== moment().day("Monday").weekday())
                mondayDay.add(1, "day");
        } else {
            while (mondayDay.weekday() !== moment().day("Monday").weekday())
                mondayDay.subtract(1, "day");
        }

        const fridayDay = mondayDay.clone();
        while (fridayDay.weekday() !== moment().day("Friday").weekday())
            fridayDay.add(1, "day");

        const dates = this.getRangeOfDates(mondayDay, fridayDay, "day");

        dates.forEach(date => {
            eventsDates[date.format("D. M. YYYY")] = {full: [], others: []};
        });
        events.forEach(event => {
            let dateEnd = moment(event.end, "D. M. YYYY");
            if (!dateEnd.isValid())
                dateEnd = moment(event.end, "D. M. YYYY HH:mm");

            let dateStart = moment(event.start, "D. M. YYYY");
            if (!dateStart.isValid())
                dateStart = moment(event.start, "D. M. YYYY HH:mm");

            if(dateStart.format("D. M. YYYY") != dateEnd.format("D. M. YYYY")){
                if (eventsDates[dateStart.format("D. M. YYYY")] != undefined)
                    eventsDates[dateStart.format("D. M. YYYY")].full.push(event);
                    
                if (eventsDates[dateEnd.format("D. M. YYYY")] != undefined)
                    eventsDates[dateEnd.format("D. M. YYYY")].full.push(event);
            } else {
                if (eventsDates[dateEnd.format("D. M. YYYY")] != undefined)
                    eventsDates[dateEnd.format("D. M. YYYY")].others.push(event);
            }
        });

        let eventsText = "";
        const days = ["Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek"];
        let daysCounter = 0;
        let counter = 0;
        let groups = {};

        Object.keys(eventsDates).forEach((date) => {
            const events = eventsDates[date];

            eventsText += `<li class="events-group"><div class="top-info"><span>` + days[daysCounter++] + `</span></div><ul>`;

            let lastDate = moment(date, "D. M. YYYY").set("hours", 8);
            events.others.forEach((event) => {
                counter++;

                let dateEnd = moment(event.end, "D. M. YYYY HH:mm");
                if (!dateEnd.isValid())
                    dateEnd = moment(event.end, "D. M. YYYY");
    
                let dateStart = moment(event.start, "D. M. YYYY HH:mm");
                if (!dateStart.isValid())
                    dateStart = moment(event.start, "D. M. YYYY");

                if(dateStart.hours() < 8) {
                    dateStart.set("hour", 8);
                    dateEnd.set("minutes", 00);
                }
                if(dateEnd.hours() > 17) {
                    dateEnd.set("hour", 17);
                    dateEnd.set("minutes", 30);
                }
                
                lastDate = dateEnd.clone();

                eventsText += `
                <li class="single-event" data-start="` + dateStart.format("HH:mm") + `" data-end="` + dateEnd.format("HH:mm") + `"
                    data-event="event-` + counter + `" data-group="` + event.role + `">
                    <a href="#0">
                        <em class="event-name">` + event.subject + " | " + (event.title == event.title.substring(0, 16) ? event.title : event.title.substring(0, 16)) + `</em>
                    </a>
                </li>`;

                if(groups[event.role] == undefined) {
                    groups[event.role] = channel.guild.roles.get(Config.get("roles.mentionable." + event.role)).hexColor;
                }
            });

            events.full.forEach((event) => {
                counter++;

                let dateEnd = moment(event.end, "D. M. YYYY HH:mm");
                if (!dateEnd.isValid())
                    dateEnd = moment(event.end, "D. M. YYYY");
    
                let dateStart = moment(event.start, "D. M. YYYY HH:mm");
                if (!dateStart.isValid())
                    dateStart = moment(event.start, "D. M. YYYY");

                let title;
                if(dateEnd.format("D. M. YYYY") == date) {
                    title = "KONEC";
                }
                if(dateStart.format("D. M. YYYY") == date) {
                    title = "ZAČÁTEK";
                }

                dateStart = lastDate.clone();
                lastDate = lastDate.add(45, "minutes")
                dateEnd = lastDate.clone();

                eventsText += `
                <li class="single-event" data-time="` + title + `" data-start="` + dateStart.format("HH:mm") + `" data-end="` + dateEnd.format("HH:mm") + `"
                    data-event="event-` + counter + `" data-group="` + event.role + `">
                    <a href="#0">
                        <em class="event-name">` + event.subject + " | " + (event.title == event.title.substring(0, 16) ? event.title : event.title.substring(0, 16)) + `</em>
                    </a>
                </li>`;

                if(groups[event.role] == undefined) {
                    groups[event.role] = channel.guild.roles.get(Config.get("roles.mentionable." + event.role)).hexColor;
                }
            });

            eventsText += `</ul></li>`;
        });

        let groupText = "";

        Object.keys(groups).forEach(group => {
            groupText += `
            .cd-schedule .single-event[data-group="`+group+`"],
            .cd-schedule [data-event="`+group+`"] .header-bg {
              background: `+groups[group]+`;
            }`;
        });

        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.setViewport({
                   width: 1440,
                   height: 1100,
                   deviceScaleFactor: 1,
                 });            
        await page.setContent((await fs.readFileSync("./src/graphic/timetable.html") + "")
            .replace("{events}", eventsText)
            .replace("{groups}", groupText)
            .replace("{week_number}", moment().weeksInYear())
            .replace("{start_date}", mondayDay.format("D. M. YYYY"))
            .replace("{end_date}", fridayDay.format("D. M. YYYY")));
        const session = await page.target().createCDPSession();
        await session.send('Emulation.setPageScaleFactor', {
          pageScaleFactor: 1,
        });
        await page.screenshot({path: "timetable.png"});//, fullPage: true})
        await browser.close();

        await channel.send(new Discord.Attachment("timetable.png"));

    }

    async printWeek(channel) {
        const mondayDay = moment();
        while (mondayDay.weekday() !== moment().day("Monday").weekday())
            mondayDay.subtract(1, "day");

        const sundayDay = mondayDay.clone();
        while (sundayDay.weekday() !== moment().day("Sunday").weekday())
            sundayDay.add(1, "day");

        const dates = this.getRangeOfDates(mondayDay, sundayDay, "day");

        const datesInfo = {};
        await this.asyncForEach(dates, async (date) => {
            const startsEvents = await this.eventModule.getEventThatStartsInEnteredDay(date, true);
            const endsEvents = await this.eventModule.getEventThatEndsInEnteredDay(date, true);
            const goingEvents = await this.eventModule.getEventThatGoingInEnteredDay(date, true);
            const events = startsEvents.concat(endsEvents).concat(goingEvents);

            let string = "";
            if (events != null)
                events.forEach(event => {
                    string += "**" + event.title + "** - " + channel.guild.roles.find(r => r.id == this.eventModule.getMentionableRolesIds()[event.role]) + "\n";
                });

            if (string == "")
                string = Translation.translate("command.event.check.week.no-event-found");

            datesInfo[date] = { "date": date, "data": string };
        });

        const embed = new Discord.RichEmbed()
            .setTitle(Translation.translate("command.event.check.week.title", ""))
            .setColor(Config.getColor("SUCCESS"))
            .setDescription(Translation.translate("command.event.check.description"));

        Object.keys(datesInfo).forEach(date => {
            embed.addField(Translation.translate("command.event.check.week." + datesInfo[date].date.isoWeekday()) + " " + datesInfo[date].date.format("D. M."), datesInfo[date].data);
        });

        await channel.send(embed);
    }

    async printNextWeek(channel){
        const mondayDay = moment();
        while (mondayDay.weekday() !== moment().day("Monday").weekday())
            mondayDay.add(1, "day");

        const sundayDay = mondayDay.clone();
        while (sundayDay.weekday() !== moment().day("Sunday").weekday())
            sundayDay.add(1, "day");

        const dates = this.getRangeOfDates(mondayDay, sundayDay, "day");

        const datesInfo = {};
        await this.asyncForEach(dates, async (date) => {
            const startsEvents = await this.eventModule.getEventThatStartsInEnteredDay(date, true);
            const endsEvents = await this.eventModule.getEventThatEndsInEnteredDay(date, true);
            const goingEvents = await this.eventModule.getEventThatGoingInEnteredDay(date, true);
            const events = startsEvents.concat(endsEvents).concat(goingEvents);

            let string = "";
            if (events != null)
                events.forEach(event => {
                    string += "**" + event.title + "** - " + channel.guild.roles.find(r => r.id == this.eventModule.getMentionableRolesIds()[event.role]) + "\n";
                });

            if (string == "")
                string = Translation.translate("command.event.check.nextweek.no-event-found");

            datesInfo[date] = { "date": date, "data": string };
        });

        const embed = new Discord.RichEmbed()
            .setTitle(Translation.translate("command.event.check.nextweek.title", ""))
            .setColor(Config.getColor("SUCCESS"))
            .setDescription(Translation.translate("command.event.check.description"));

        Object.keys(datesInfo).forEach(date => {
            embed.addField(Translation.translate("command.event.check.week." + datesInfo[date].date.isoWeekday()) + " " + datesInfo[date].date.format("D. M."), datesInfo[date].data);
        });

        await channel.send(embed);
    }

    getRangeOfDates(start, end, key, arr = [start.startOf(key)]) {
        if (start.isAfter(end))
            throw new Error("start must precede end");

        const next = moment(start).add(1, key).startOf(key);

        if (next.isAfter(end, key))
            return arr;

        return this.getRangeOfDates(next, end, key, arr.concat(next));
    }

    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) 
            await callback(array[index], index, array);
        
    }

    event(name, args) {}

}

module.exports = EventTimetableModule;