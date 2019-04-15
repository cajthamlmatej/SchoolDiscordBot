const Module = require("./Module");
const Discord = require('discord.js');
const Translation = require("../Translation");
const fs = require('fs');
const moment = require('moment');

class EventAnnoucementModule extends Module {

    getName() {
        return "eventannoucementmodule";
    }

    init(bot) {
        this.eventModule = bot.modules.eventmodule;
        this.channel = bot.client.channels.find(ch => ch.id == bot.settings.channels.eventannoucement);
        this.checkTime = bot.settings.modules.eventannoucement.checkTime;
        this.tempFile = "./temp/eventannoucement.json";

        if (this.eventModule != undefined) {
            setInterval(() => this.tick(), 5000);
        }
    }

    tick() {
        let time = moment();
        let checkTime = moment(this.checkTime[moment().isoWeekday()-1], "HH:mm");

        let diff = time.diff(checkTime, "seconds");

        if (diff < 0 || this.getLastCheck() == time.format("D. M. YYYY"))
            return;

        this.saveLastCheck(time.format("D. M. YYYY"));

        // tomorrow
        time.add(1, "days");

        let events = this.eventModule.getEvents();
        Object.keys(events).forEach(eventName => {
            let event = events[eventName];
            let eventValues = event.values;

            let dateEnd = moment(eventValues.end, "D. M. YYYY");
            if (!dateEnd.isValid()) {
                dateEnd = moment(eventValues.end, "D. M. YYYY HH:mm");
            }

            let dateStart = moment(eventValues.start, "D. M. YYYY");
            if (!dateStart.isValid()) {
                dateStart = moment(eventValues.start, "D. M. YYYY HH:mm");
            }

            let name = "";
            if (dateEnd.date() == time.date() && dateEnd.month() == time.month() && eventValues.end != eventValues.start)
                name = "ends";
            else if (dateEnd.date() == time.date() && dateEnd.month() == time.month() && eventValues.end == eventValues.start)
                name = "going";
            else if (dateStart.date() == time.date() && dateStart.month() == time.month())
                name = "starts";

            if (name == "")
                return;

            let embed = new Discord.RichEmbed()
                .setTitle(Translation.translate("module.eventannoucement.title." + name))
                .setColor(0xbadc58)
                .setDescription(Translation.translate("module.eventannoucement.description." + name, time.format("D. M. YYYY"), eventName))
                .addField(Translation.translate("module.eventannoucement.informations"), eventValues.description)
                .addField(Translation.translate("module.eventannoucement.role"), this.channel.guild.roles.find(r => r.id == this.eventModule.getMentionableRolesIds()[eventValues.role]), true)
                .addField(Translation.translate("module.eventannoucement.subject"), eventValues.subject, true)
                .addField(Translation.translate("module.eventannoucement.place"), eventValues.place, true);

            this.channel.send(embed);
        });
    }

    getLastCheck() {
        let fileContents = fs.readFileSync(this.tempFile, "utf8");
        let json = JSON.parse(fileContents);

        return json.lastcheck;
    }

    saveLastCheck(lastcheck) {
        fs.writeFileSync(this.tempFile, JSON.stringify({ "lastcheck": lastcheck }));
    }

    event(name, args) {
    }

}

module.exports = EventAnnoucementModule;