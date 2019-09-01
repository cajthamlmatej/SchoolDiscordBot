const Module = require("./Module");
const fs = require("fs");
const puppeteer = require("puppeteer");
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

        await this.update();
    }

    async update() {
        if (this.eventModule == undefined)
            return;

        const channel = this.channel;
        await channel.bulkDelete(50).catch(e => { });

        let mondayDay = moment();
        while (mondayDay.weekday() !== moment().day("Monday").weekday())
            mondayDay.subtract(1, "day");
        await this.printTimetable(channel, mondayDay);
        
        mondayDay = moment();
        mondayDay.add(1, "day");
        while (mondayDay.weekday() !== moment().day("Monday").weekday())
            mondayDay.add(1, "day");

        await this.printTimetable(channel, mondayDay);
        
        mondayDay.add(1, "day");
        while (mondayDay.weekday() !== moment().day("Monday").weekday())
            mondayDay.add(1, "day");

        await this.printTimetable(channel, mondayDay);
    }

    getTimetable(day) {
        let events = [];
        switch (day.weekday()) {
        case 1:
            events = [
                {
                    title: "ANG",
                    start: "08:00",
                    end: "08:45"
                },
                {
                    title: "MAT",
                    start: "08:55",
                    end: "09:40"
                },
                {
                    title: "OSC & PVA",
                    start: "10:00",
                    end: "11:40"
                },
                {
                    title: "PRA",
                    start: "11:50",
                    end: "12:35"
                },

                {
                    title: "TEV",
                    start: "13:40",
                    end: "15:20"
                }
            ];
            break;
        case 2:
            events = [
                {
                    title: "MAP",
                    start: "08:00",
                    end: "09:40"
                },
                {
                    title: "MAT",
                    start: "10:00",
                    end: "10:45"
                },
                {
                    title: "CJL",
                    start: "10:55",
                    end: "11:40"
                },
                {
                    title: "FYZ",
                    start: "11:50",
                    end: "12:35"
                },
            ];
            break;
        case 3:
            events = [
                {
                    title: "VYT",
                    start: "08:00",
                    end: "09:40"
                },
                {
                    title: "ANG",
                    start: "10:00",
                    end: "10:45"
                },
                {
                    title: "MAT",
                    start: "10:55",
                    end: "11:40"
                },
                {
                    title: "CJL",
                    start: "11:50",
                    end: "12:35"
                },
                {
                    title: "EKO",
                    start: "12:45",
                    end: "13:30"
                },
            ];
            break;
        case 4:

            events = [
                {
                    title: "MAT",
                    start: "08:00",
                    end: "08:45"
                },
                {
                    title: "ONA",
                    start: "08:55",
                    end: "09:40"
                },
                {
                    title: "ANG & CJL",
                    start: "10:00",
                    end: "10:45"
                },
                {
                    title: "OSY",
                    start: "10:55",
                    end: "11:40"
                },
                {
                    title: "PVA & OSC",
                    start: "11:50",
                    end: "13:30"
                },
            ];
            break;
        case 5:

            events = [
                {
                    title: "MAT",
                    start: "08:00",
                    end: "08:45"
                },
                {
                    title: "CJL & ANG",
                    start: "08:55",
                    end: "09:40"
                },

                {
                    title: "EKO",
                    start: "10:00",
                    end: "10:45"
                },
                {
                    title: "FYZ",
                    start: "10:55",
                    end: "11:40"
                },
                {
                    title: "VOP",
                    start: "11:50",
                    end: "14:25"
                },
            ];
            break;
        }
        let eventsText = "";

        const today = day.format("YYYY-MM-DD");
        events.forEach(event => {
            eventsText += `
                {
                    startDate: new Date("` + moment(today + " " + event.start).toDate() + `"),
                    endDate: new Date("` + moment(today + " " + event.end).toDate() + `"),
                    title: "` + event.title + `",
                    class: "school",
                    background: "true",
                },
            `;
        });

        return eventsText;
    }

    getIconForSubject(subject) {
        switch (subject) {
        case "CJL":
            return "book-reader";
        case "MAT":
            return "divide";
        case "EKO":
            return "ghost";
        case "PRO":
            return "balance-scale";
        case "FYZ":
            return "apple-alt";
        case "ANG":
            return "comments";
        case "TEV":
            return "weight-hanging";
        case "OSY":
            return "network-wired";
        case "PVA":
            return "keyboard";
        }

        return "question";
    }

    async printTimetable(channel, mondayDay) {
        const events = await eventRepository.getAllEvents();
        let eventsText = "";

        events.forEach(event => {
            const startDate = moment(event.start, "D. M. YYYY HH:mm").toDate();
            const endDate = moment(event.end, "D. M. YYYY HH:mm").toDate();
            eventsText += `
                {
                    startDate: new Date("` + startDate + `"),
                    endDate: new Date("` + endDate + `"),
                    title: "` + event.title + `",
                    content: "<i class='fas fa-` + this.getIconForSubject(event.subject) + "'></i> " + (event.subject === "?" ? "" : event.subject) + `",
                    class: "` + event.role + `",
                    allDay: ` + (endDate.toString() == startDate.toString()) + `
                },
            `;
        });

        const sundayDay = mondayDay.clone();
        while (sundayDay.weekday() !== moment().day("Sunday").weekday())
            sundayDay.add(1, "day");

        const dates = this.getRangeOfDates(mondayDay, sundayDay, "day");

        dates.forEach(date => {
            eventsText += this.getTimetable(date);
        });

        const browser = await puppeteer.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
        const page = await browser.newPage();
        await page.setViewport({
            width: 1440,
            height: 1400,
            deviceScaleFactor: 1,
        });
        await page.setContent((await fs.readFileSync("./src/graphic/timetable.html") + "")
            .replace("__EVENTS__", eventsText)
            .replace("__SELECTED_DATE__", mondayDay.format("YYYY-MM-DD")));

        await page.waitFor(4000);
        await page.screenshot({ path: "timetable.png" });

        await channel.send(new Discord.Attachment("timetable.png"));
        
        await browser.close();
    }

    getRangeOfDates(start, end, key, arr = [start.startOf(key)]) {
        if (start.isAfter(end))
            throw new Error("start must precede end");

        const next = moment(start).add(1, key).startOf(key);

        if (next.isAfter(end, key))
            return arr;

        return this.getRangeOfDates(next, end, key, arr.concat(next));
    }

    event(name, args) { }

}

module.exports = EventTimetableModule;