const Module = require("./Module");
const Discord = require("discord.js");
const Translation = require("../Translation");
const fs = require("fs");
const moment = require("moment");
const Config = require("../Config");

class EventAnnoucementModule extends Module {

    getName() {
        return "eventannoucementmodule";
    }

    init(bot) {
        this.eventModule = bot.modules.eventmodule;
        this.channel = bot.client.channels.find(ch => ch.id == Config.get("channels.annoucement"));
        this.checkTime = Config.get("modules.event-annoucement.check-time");
        this.tempFile = "./eventannoucement-lastcheck.json";

        if (this.eventModule != undefined)
            this.interval = setInterval(() => this.tick(), 5000);

        this.eventTimetableModule = bot.modules.eventtimetablemodule;
    }

    uninit() {
        clearTimeout(this.interval);
    }

    async tick() {
        const time = moment();
        const checkTime = moment(this.checkTime[moment().isoWeekday() - 1], "HH:mm");

        const diff = time.diff(checkTime, "seconds");

        if (diff < 0 || this.getLastCheck() == time.format("D. M. YYYY"))
            return;

        this.saveLastCheck(time.format("D. M. YYYY"));

        this.eventTimetableModule.update();

        // tomorrow
        time.add(1, "days");

        const events = await this.eventModule.getEvents();
        events.forEach(event => {
            let dateEnd = moment(event.end, "D. M. YYYY");
            if (!dateEnd.isValid())
                dateEnd = moment(event.end, "D. M. YYYY HH:mm");

            let dateStart = moment(event.start, "D. M. YYYY");
            if (!dateStart.isValid())
                dateStart = moment(event.start, "D. M. YYYY HH:mm");

            let name = "";
            if (dateEnd.date() == time.date() && dateEnd.month() == time.month() && event.end != event.start)
                name = "ends";
            else if (dateEnd.date() == time.date() && dateEnd.month() == time.month() && event.end == event.start)
                name = "going";
            else if (dateStart.date() == time.date() && dateStart.month() == time.month())
                name = "starts";

            if (name == "")
                return;

            const dmembed = new Discord.RichEmbed()
                .setTitle("👁 | " + Translation.translate("module.eventannoucement." + event.type + ".title." + name))
                .setColor(Config.getColor("SUCCESS"))
                .setDescription(Translation.translate("module.eventannoucement." + event.type + ".description." + name, time.format("D. M. YYYY"), event.title))
                .addField(Translation.translate("module.eventannoucement.informations"), event.description)
                .addField(Translation.translate("module.eventannoucement.role"), this.channel.guild.roles.find(r => r.id == this.eventModule.getMentionableRolesIds()[event.role]).name, true)
                .addField(Translation.translate("module.eventannoucement.subject"), event.subject, true)
                .addField(Translation.translate("module.eventannoucement.place"), event.place, true);

            const embed = new Discord.RichEmbed()
                .setTitle(("👁 | " + Translation.translate("module.eventannoucement." + event.type + ".title." + name)))
                .setColor(Config.getColor("SUCCESS"))
                .setDescription(Translation.translate("module.eventannoucement." + event.type + ".description." + name, time.format("D. M. YYYY"), event.title))
                .addField(Translation.translate("module.eventannoucement.informations"), event.description)
                .addField(Translation.translate("module.eventannoucement.role"), this.channel.guild.roles.find(r => r.id == this.eventModule.getMentionableRolesIds()[event.role]), true)
                .addField(Translation.translate("module.eventannoucement.subject"), event.subject, true)
                .addField(Translation.translate("module.eventannoucement.place"), event.place, true);

            this.channel.guild.members.forEach((member) => {
                if (member.roles.has(this.eventModule.getMentionableRolesIds()[event.role]))
                    member.createDM().then(dm => dm.send(dmembed));

            });
            this.channel.send(embed);
        });
    }

    getLastCheck() {
        const fileContents = fs.readFileSync(this.tempFile, "utf8");
        const json = JSON.parse(fileContents);

        return json.lastcheck;
    }

    saveLastCheck(lastcheck) {
        fs.writeFileSync(this.tempFile, JSON.stringify({ "lastcheck": lastcheck }));
    }

    event(name, args) {}

}

module.exports = EventAnnoucementModule;