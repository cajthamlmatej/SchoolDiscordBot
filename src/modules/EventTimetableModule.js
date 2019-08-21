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

        this.update();
    }

    async update() {
        if (this.eventModule == undefined)
            return;

        const channel = this.channel;
        channel.bulkDelete(50).catch(e => { });

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
        let timeTableString = "";

        let events = []
        switch (day.weekday()) {
            case 1:
                events = [
                    {
                        title: "Matematika",
                        start: "08:00",
                        end: "08:45"
                    }
                ]
                break;
            case 2:

                events = [
                    {
                        title: "Matematika",
                        start: "08:00",
                        end: "08:45"
                    }
                ]
                break;
            case 3:
                events = [
                    {
                        title: "Matematika",
                        start: "08:00",
                        end: "08:45"
                    },
                    {
                        title: "Čeština",
                        start: "08:55",
                        end: "09:40"
                    },
                    {
                        title: "Občanská nauka",
                        start: "10:00",
                        end: "10:45"
                    }
                ]
                break;
            case 4:

                events = [
                    {
                        title: "Matematika",
                        start: "08:00",
                        end: "08:45"
                    }
                ]
                break;
            case 5:

                events = [
                    {
                        title: "Matematika",
                        start: "08:00",
                        end: "08:45"
                    }
                ]
                break;
        }
        let eventsText = "";

        const today = day.format("YYYY-MM-DD")
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
                return "book-reader"
            case "MAT":
                return "divide"
            case "EKO":
                return "ghost"
            case "PRO":
                return "balance-scale"
            case "FYZ":
                return "apple-alt"
            case "ANG":
                return "comments"
            case "TEV":
                return "weight-hanging"
            case "OSY":
                return "network-wired"
            case "PVA":
                return "keyboard"
        }

        return "question"
    }

    async printTimetable(channel, mondayDay) {
        const events = await eventRepository.getAllEvents();
        let eventsText = "";

        events.forEach(event => {
            const startDate = moment(event.start, "D. M. YYYY HH:mm").toDate()
            const endDate = moment(event.end, "D. M. YYYY HH:mm").toDate()
            eventsText += `
                {
                    startDate: new Date("` + startDate + `"),
                    endDate: new Date("` + endDate + `"),
                    title: "` + event.title + `",
                    content: "<i class='fas fa-` + this.getIconForSubject(event.subject) + `'></i> ` + event.subject + `",
                    class: "` + event.role + `",
                    allDay: ` + (endDate.toString() == startDate.toString()) + `
                },
            `;
        })

        const sundayDay = mondayDay.clone();
        while (sundayDay.weekday() !== moment().day("Sunday").weekday())
            sundayDay.add(1, "day");

        const dates = this.getRangeOfDates(mondayDay, sundayDay, "day");

        dates.forEach(date => {
            eventsText += this.getTimetable(date);
        })

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
        await page.screenshot({ path: "timetable.png" });
        await browser.close();

        await channel.send(new Discord.Attachment("timetable.png"));

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