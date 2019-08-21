const SubsCommand = require("./SubsCommand");
const moment = require("moment");
const Discord = require("discord.js");
const CommandBuilder = require("../CommandBuilder");
const Translation = require("../Translation");
const Config = require("../Config");
const logger = require("../Logger");

class EventCommand extends SubsCommand {

    getSubCommands() {
        return {
            "create": {
                "arguments": 0,
                "roles": ["moderator"]
            },
            "edit": {
                "arguments": 0,
                "roles": ["moderator"]
            },
            "delete": {
                "arguments": 1,
                "roles": ["moderator"]
            },
            "list": {
                "arguments": 0,
                "roles": ["moderator"]
            },
            "check": {
                "arguments": 1,
                "roles": ["member"]
            },
            "week": {
                "arguments": 0,
                "roles": ["member"]
            },
            "nextweek": {
                "arguments": 0,
                "roles": ["member"]
            },
            "refresh": {
                "arguments": 1,
                "roles": ["owner"]
            },
            "info": {
                "arguments": 1,
                "roles": ["member"]
            }
        };
    }

    getName() {
        return "event";
    }

    getGroup() {
        return "school";
    }

    getAliases() {
        return ["ev"];
    }

    getDependencies() {
        return ["eventmodule"];
    }

    init(bot) {
        this.eventModule = bot.modules["eventmodule"];
        this.placeholders = Config.get("modules.event.placeholders");
    }

    callCreate(args, message) {
        const channel = message.channel;
        const types = ["event", "task"];

        const builder = new CommandBuilder("event.create", message.author, channel, [{
            "name": "type",
            "example": types,
            "validate": (content) => {
                if (!types.includes(content))
                    return ["command.event.type-not-valid", types.join(", ")];
                else
                    return true;
            }
        },
        {
            "name": "title",
            "example": Translation.translate("builder.event.create.title.example"),
            "validate": (content) => {
                return true;
            }
        },
        {
            "name": "name",
            "example": Translation.translate("builder.event.create.name.example").split(","),
            "validate": async (content) => {
                if (await this.eventModule.exists(content))
                    return "command.event.already-exists";
                else
                    return true;
            },
            "value": (content, values) => {
                if (content == "-")
                    return values["title"].toLowerCase().split("").map(function(letter) {
                        const i = this.accents.indexOf(letter);
                        return (i !== -1) ? this.acceOut[i] : letter;
                    }.bind({
                        accents: "àáâãäåąßòóôőõöøďdžěèéêëęðçčćìíîïùűúûüůľĺłňñńŕřšśťÿýžżźž- ",
                        acceOut: "aaaaaaasoooooooddzeeeeeeeccciiiiuuuuuulllnnnrrsstyyzzzz__"
                    })).join("");
                else
                    return content;
            }
        },

        {
            "name": "start",
            "example": [moment().format("D. M. YYYY"), moment().format("D. M. YYYY HH:mm"), ... Object.keys(this.placeholders)],
            "validate": (content) => {
                let found = false;
                Object.keys(this.placeholders).forEach(placeholder => {
                    if (content.toLowerCase().includes(placeholder))
                        found = true;
                });

                if (found)
                    return true;

                if (!(moment(content, "D. M. YYYY").isValid() || moment(content, "D. M. YYYY HH:mm").isValid()))
                    return "command.event.wrong-date-format";
                else
                    return true;
            }
        },
        {
            "name": "end",
            "example": ["-", moment().add(3, "days").format("D. M. YYYY"), moment().add(3, "days").format("D. M. YYYY HH:mm"), ... Object.keys(this.placeholders)],
            "validate": (content) => {
                if (content == "-")
                    return true;

                let found = false;
                Object.keys(this.placeholders).forEach(placeholder => {
                    if (content.toLowerCase().includes(placeholder))
                        found = true;
                });

                if (found)
                    return true;

                if (!(moment(content, "D. M. YYYY").isValid() || moment(content, "D. M. YYYY HH:mm").isValid()))
                    return "command.event.wrong-date-format";
                else
                    return true;
            },
            "value": (content, values) => {
                if (content == "-")
                    return values["start"];
                else
                    return content;
            }
        },
        {
            "name": "role",
            "example": this.eventModule.getMentionableRoles()[0],
            "validate": (content) => {
                if (!this.eventModule.isMentionableRole(content))
                    return ["command.event.role-not-valid", this.eventModule.getMentionableRoles().join(", ")];
                else
                    return true;
            }
        },
        {
            "name": "place",
            "example": Translation.translate("builder.event.create.place.example").split(","),
            "validate": (content) => {
                return true;
            }
        },
        {
            "name": "subject",
            "example": Translation.translate("builder.event.create.subject.example").split(","),
            "validate": (content) => {
                return true;
            }
        },
        {
            "name": "description",
            "example": Translation.translate("builder.event.create.description.example"),
            "validate": (content) => {
                return true;
            }
        },
        {
            "name": "files",
            "example": "",
            "validate": (content) => {
                return true;
            },
            "value": (content, values, attachments) => {
                if (content == "-")
                    return [];

                const files = [];
                attachments.forEach(messageAttachment => {
                    files.push(messageAttachment.url);
                });

                return files;
            }
        }
        ], (values) => {
            logger.info("User " + message.member.displayName + " created event with name " + values["name"] + ".");

            let start = values["start"];
            let end = values["end"];

            Object.keys(this.placeholders).forEach(placeholder => {
                const placeholderObj = this.placeholders[placeholder];

                if (values["start"].toLowerCase().includes(placeholder))
                    start = moment().add(placeholderObj.quantity, placeholderObj.unit).format("D. M. YYYY");

                if (values["end"].toLowerCase().includes(placeholder))
                    end = moment().add(placeholderObj.quantity, placeholderObj.unit).format("D. M. YYYY");
            });

            this.eventModule.addEvent(values["name"], values["type"], values["title"], start, end, values["role"], values["place"], values["subject"], values["description"], message.member, values["files"]);
        });

        builder.start();
        return true;
    }

    callEdit(args, message) {
        const channel = message.channel;
        const types = ["name", "type", "title", "start", "end", "role", "place", "subject", "description"];
        const eventTypes = ["event", "task"];

        const builder = new CommandBuilder("event.edit", message.author, channel, [{
            "name": "name",
            "example": "eko_ukol_potreby",
            "validate": async (content) => {
                if (!(await this.eventModule.exists(content)))
                    return ["command.event.dont-exist.edit", (await this.eventModule.getEventNames()).join(", ").substring(0, 500) + "..."];
                else
                    return true;

            }
        },
        {
            "name": "type",
            "example": types,
            "validate": (content) => {
                if (!types.includes(content))
                    return ["command.event.edit-type-not-valid", types.join(", ")];
                else
                    return true;
            }
        },
        {
            "name": "value",
            "example": eventTypes.concat(["?"]),
            "validate": (content, values) => {
                const type = values["type"];

                if (type == "type") {
                    if (!eventTypes.includes(content))
                        return ["command.event.type-not-valid", eventTypes.join(", ")];

                } else if (type == "role")
                    if (!this.eventModule.isMentionableRole(content)) {
                        return ["command.event.role-not-valid", this.eventModule.getMentionableRoles().join(", ")];
                    }

                return true;
            }
        }
        ], (values) => {
            logger.info("User " + message.member.displayName + " edited event with name " + values["name"] + ", edited " + values["type"] + " to " + values["value"] + ".");

            this.eventModule.editEvent(values["name"], values["type"], values["value"], message.author.id);
        });

        builder.start();
        return true;
    }

    async callDelete(args, message) {
        const channel = message.channel;
        const name = args[0];

        if (!this.eventModule.exists(name)) {
            this.sendError(channel, "command.event.dont-exist");
            return;
        }

        await this.eventModule.deleteEvent(name);
    }

    callList(args, message) {
        this.eventModule.printEventList(message.author);

        message.react("✅");
    }

    async callCheck(args, message) {
        const channel = message.channel;
        const dateString = args.join(" ");

        let date;

        Object.keys(this.placeholders).forEach(placeholder => {
            if (dateString.includes(placeholder))
                date = moment().add(this.placeholders[placeholder].quantity, this.placeholders[placeholder].unit);
        });

        if (date == undefined)
            date = moment(dateString, "D. M. YYYY");

        if (!date.isValid()) {
            date = moment(dateString, "D. M. YYYY HH:mm");

            if (!date.isValid()) {
                this.sendError(channel, "command.event.wrong-date-format");
                return;
            }
        }

        const startsEvents = await this.eventModule.getEventThatStartsInEnteredDay(date, true);
        let starts = "";

        startsEvents.forEach(event => {
            starts += "**" + event.title + "** - " + channel.guild.roles.find(r => r.id == this.eventModule.getMentionableRolesIds()[event.role]) + " - *" + event.description + "*\n";
        });

        const endsEvents = await this.eventModule.getEventThatEndsInEnteredDay(date, true);
        const ends = "";

        endsEvents.forEach(event => {
            let ends = "";
            ends += "**" + event.title + "** - " + channel.guild.roles.find(r => r.id == this.eventModule.getMentionableRolesIds()[event.role]) + " - *" + event.description + "*\n";
        });

        const goingEvents = await this.eventModule.getEventThatGoingInEnteredDay(date, true);
        let going = "";

        goingEvents.forEach(event => {
            going += "**" + event.title + "** - " + channel.guild.roles.find(r => r.id == this.eventModule.getMentionableRolesIds()[event.role]) + " - *" + event.description + "*\n";
        });

        if (ends == "" && starts == "" && going == "") {
            this.sendError(channel, "module.event.no-event-exists");
            return;
        }

        const embed = new Discord.RichEmbed()
            .setTitle(Translation.translate("command.event.check.title", dateString))
            .setColor(Config.getColor("SUCCESS"))
            .setDescription(Translation.translate("command.event.check.description"));

        if (starts != "")
            embed.addField(Translation.translate("command.event.check.starts"), starts);

        if (ends != "")
            embed.addField(Translation.translate("command.event.check.ends"), ends);

        if (going != "")
            embed.addField(Translation.translate("command.event.check.going"), going);

        channel.send(embed);
    }

    async callWeek(args, message) {
        const channel = message.channel;

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

        channel.send(embed);
    }

    async callNextweek(args, message) {
        const channel = message.channel;

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

        channel.send(embed);
    }

    async asyncForEach(array, callback) {
        for (let index = 0; index < array.length; index++) 
            await callback(array[index], index, array);
        
    }

    async callRefresh(args, message) {
        const eventName = args[0];

        if (eventName == "all") {
            const events = await this.eventModule.getEvents();

            events.forEach(event => {
                this.eventModule.editEvent(event.name, "refresh", undefined);
            });
        } else {
            if (!(await this.eventModule.exists(eventName))) {
                this.sendError(message.channel, "command.event.dont-exist.edit", (await this.eventModule.getEventNames()).join(", ").substring(0, 500) + "...");
                return;
            }

            this.eventModule.editEvent(eventName, "refresh", undefined);
        }

        message.react("✅");
    }

    getRangeOfDates(start, end, key, arr = [start.startOf(key)]) {
        if (start.isAfter(end))
            throw new Error("start must precede end");

        const next = moment(start).add(1, key).startOf(key);

        if (next.isAfter(end, key))
            return arr;

        return this.getRangeOfDates(next, end, key, arr.concat(next));
    }

    async callInfo(args, message) {
        const eventName = args[0];

        if (!(await this.eventModule.exists(eventName))) {
            this.sendError(message.channel, "command.event.dont-exist.edit", (await this.eventModule.getEventNames()).join(", ").substring(0, 500) + "...");
            return;
        }

        const event = await this.eventModule.getEvent(eventName, null);
        const historyTexts = [];
        let historyText = "";

        await this.asyncForEach(event.history, async (history) => {
            const text = "```[" + moment(history.changed).format("D. M. YYYY HH:MM:ss") + " | " + history.type + "] " + (await message.guild.fetchMember(history.author)).displayName + "\n" + history.value.old + " -> " + history.value.new + "```\n";
            
            if((historyText + text).length > 2048) {
                historyTexts.push(historyText);
                historyText = "";
            }

            historyText += text;
        });

        if(historyText != "")
            historyTexts.push(historyText);
        
        const embed = new Discord.RichEmbed()
            .setTitle("🕜 | " + Translation.translate("command.event.info.title." + event.type, event.title))
            .setDescription("")
            .addField(Translation.translate("module.event.name"), event.name, true)
            .addField(Translation.translate("module.event.title"), event.title, true)
            .addField(Translation.translate("module.event.start"), event.start, true)
            .addField(Translation.translate("module.event.end"), event.end, true)
            .addField(Translation.translate("module.event.group"), message.guild.roles.get(Config.get("roles.mentionable." + event.role)), true)
            .addField(Translation.translate("module.event.place"), event.place, true)
            .addField(Translation.translate("module.event.subject"), event.subject, true)
            .addField(Translation.translate("module.event.description"), event.description)
            .addField(Translation.translate("module.event.created"), moment(event.created).format("D. M. YYYY HH:MM:ss"), true)
            .addField(Translation.translate("module.event.archived"), event.archived ? ":white_check_mark:" : ":x:", true)
            .addField(Translation.translate("module.event.author"), (await message.guild.fetchMember(event.author)).toString(), true)
            .addField(Translation.translate("module.event.message"), "[" + Translation.translate("module.event.message") + "](https://discordapp.com/channels/" + Config.get("bot.guild") + "/" + Config.get("channels.event") + "/" + event.message + ")", true)
            .addField(Translation.translate("module.event.calendar"), this.eventModule.generateGoogleCalendarLink(event), true)
            .setColor(Config.getColor("SUCCESS"));

        let promise = Promise.resolve();
        promise = promise.then(async () => await message.channel.send(embed));

        let count = 1;
        historyTexts.forEach((history) => {
            const historyEmbed = new Discord.RichEmbed()
                .setTitle("🕜 | " + Translation.translate("command.event.info.history.title." + event.type, event.title, count))
                .setDescription(history)
                .setColor(Config.getColor("SUCCESS"));    

            promise = promise.then(async () => await message.channel.send(historyEmbed));
            count++;
        });
    }

}

module.exports = EventCommand;