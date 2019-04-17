
const SubsCommand = require("./SubsCommand");
const moment = require('moment');
const Discord = require('discord.js');
const CommandBuilder = require("../CommandBuilder");
const Translation = require("../Translation");

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
            }
        }
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
        this.stopWord = bot.settings.modules.builder.stopWord;
        this.placeholders = bot.settings.modules.event.placeholders;
    }

    callCreate(args, message) {
        let channel = message.channel;
        const types = ["event", "task"];

        let builder = new CommandBuilder("event.create", message.author, channel, [
            {
                "name": "type",
                "example": types,
                "validate": (content) => {
                    if (!types.includes(content)) {
                        return ["command.event.type-not-valid", types.join(", ")];
                    } else
                        return true;
                }
            },
            {
                "name": "name",
                "example": "eko_ukol_potreby",
                "validate": (content) => {
                    if (this.eventModule.exists(content)) {
                        return "command.event.already-exists";
                    } else {
                        return true;
                    }
                }
            },
            {
                "name": "start",
                "example": [moment().format("D. M. YYYY"), moment().format("D. M. YYYY HH:mm")],
                "validate": (content) => {
                    if (!(moment(content, "D. M. YYYY").isValid() || moment(content, "D. M. YYYY HH:mm").isValid())) {
                        return "command.event.wrong-date-format";
                    } else
                        return true;
                }
            },
            {
                "name": "end",
                "example": ["-", moment().add(3, 'days').format("D. M. YYYY"), moment().add(3, 'days').format("D. M. YYYY HH:mm")],
                "validate": (content) => {
                    if (content == "-")
                        return true;

                    if (!(moment(content, "D. M. YYYY").isValid() || moment(content, "D. M. YYYY HH:mm").isValid())) {
                        return "command.event.wrong-date-format";
                    } else
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
                "example": "member",
                "validate": (content) => {
                    if (!this.eventModule.isMentionableRole(content)) {
                        return ["command.event.role-not-valid", this.eventModule.getMentionableRoles().join(", ")];
                    } else
                        return true;
                }
            },
            {
                "name": "place",
                "example": ["Škola", "School", "Arbesovo náměstí"],
                "validate": (content) => {
                    return true;
                }
            },
            {
                "name": "subject",
                "example": ["STP", "?"],
                "validate": (content) => {
                    return true;
                }
            },
            {
                "name": "description",
                "example": ["Popis eventu", "Description of event"],
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
                    if (content == "-") {
                        return [];
                    }

                    let files = [];
                    attachments.forEach(messageAttachment => {
                        files.push(messageAttachment.url);
                    });

                    return files;
                }
            }
        ], (values) => {
            console.log("User " + message.author.username + " created event with name " + values["name"] + ".");

            this.eventModule.addEvent(values["name"], values["type"], values["start"], values["end"], values["role"], values["place"], values["subject"], values["description"], message.member, values["files"]); //files);
        }, this.stopWord);

        builder.start();
        return true;
    }

    callEdit(args, message) {
        let channel = message.channel;
        const types = ["name", "type", "start", "end", "role", "place", "subject", "description"];
        const eventTypes = ["event", "task"];

        let builder = new CommandBuilder("event.edit", message.author, channel, [
            {
                "name": "name",
                "example": "eko_ukol_potreby",
                "validate": (content) => {
                    if (!this.eventModule.exists(content)) {
                        return "command.event.dont-exist";
                    } else {
                        return true;
                    }
                }
            },
            {
                "name": "type",
                "example": types,
                "validate": (content) => {
                    if (!types.includes(content)) {
                        return ["command.event.edit-type-not-valid", types.join(", ")];
                    } else
                        return true;
                }
            },
            {
                "name": "value",
                "example": eventTypes.concat(["?"]),
                "validate": (content, values) => {
                    let type = values["type"];

                    if (type == "type") {
                        if (!eventTypes.includes(content)) {
                            return ["command.event.type-not-valid", eventTypes.join(", ")];
                        }
                    } else if (type == "role") {
                        if (!this.eventModule.isMentionableRole(content)) {
                            return ["command.event.role-not-valid", this.eventModule.getMentionableRoles().join(", ")];
                        }
                    }

                    return true;
                }
            }
        ], (values) => {
            console.log("User " + message.author.username + " edited event with name " + values["name"] + ", edited " + values["type"] + " to " + values["value"] + ".");

            this.eventModule.editEvent(values["name"], values["type"], values["value"]);
        }, this.stopWord);

        builder.start();
        return true;
    }

    callDelete(args, message) {
        let channel = message.channel;
        let name = args[0];

        if (!this.eventModule.exists(name)) {
            this.sendError(channel, "command.event.dont-exist");
            return;
        }

        this.eventModule.deleteEvent(name);

        return true;
    }

    callList(args, message) {
        this.eventModule.printEventList(message.author);

        message.react("✅");
    }

    callCheck(args, message) {
        let channel = message.channel;
        let dateString = args[0];

        let date;

        Object.keys(this.placeholders).forEach(placeholder => {
            if (dateString.includes(placeholder)) {
                date = moment().add(this.placeholders[placeholder], 'days')
            }
        });

        if (date == undefined) {
            date = moment(dateString, "D. M. YYYY");
        }

        if (!date.isValid()) {
            date = moment(dateString, "D. M. YYYY HH:mm");

            if (!date.isValid()) {
                this.sendError(channel, "command.event.wrong-date-format");
                return;
            }
        }

        let startsEvents = this.eventModule.getEventThatStartsInEnteredDay(date);
        let starts = "";

        startsEvents.forEach(event => {
            starts += "**" + event.name + "** - " + channel.guild.roles.find(r => r.id == this.eventModule.getMentionableRolesIds()[event.role]) + " - *" + event.description + "*\n";
        });

        let endsEvents = this.eventModule.getEventThatEndsInEnteredDay(date);
        let ends = "";

        endsEvents.forEach(event => {
            let ends = "";
            ends += "**" + event.name + "** - " + channel.guild.roles.find(r => r.id == this.eventModule.getMentionableRolesIds()[event.role]) + " - *" + event.description + "*\n";
        });

        let goingEvents = this.eventModule.getEventThatGoingInEnteredDay(date);
        let going = "";

        goingEvents.forEach(event => {
            going += "**" + event.name + "** - " + channel.guild.roles.find(r => r.id == this.eventModule.getMentionableRolesIds()[event.role]) + " - *" + event.description + "*\n";
        });

        if (ends == "" && starts == "" && going == "") {
            this.sendError(channel, "module.event.no-event-exists");
            return;
        }

        let embed = new Discord.RichEmbed()
            .setTitle(Translation.translate("command.event.check.title", dateString))
            .setColor(0xbadc58)
            .setDescription(Translation.translate("command.event.check.description"));

        if (starts != "")
            embed.addField(Translation.translate("command.event.check.starts"), starts);

        if (ends != "")
            embed.addField(Translation.translate("command.event.check.ends"), ends);

        if (going != "")
            embed.addField(Translation.translate("command.event.check.going"), going);


        channel.send(embed);
    }
    
    callWeek(args, message) {
        let channel = message.channel;

        let startDay = moment();

        let sundayDay = startDay.clone();
        while (sundayDay.weekday() !== moment().day('Sunday').weekday()){ 
            sundayDay.add(1, 'day'); 
        }

        let dates = this.getRangeOfDates(startDay, sundayDay, 'day');

        let datesInfo = {};
        dates.forEach(date => {
            let startsEvents = this.eventModule.getEventThatStartsInEnteredDay(date);
            let endsEvents = this.eventModule.getEventThatEndsInEnteredDay(date);
            let goingEvents = this.eventModule.getEventThatGoingInEnteredDay(date);
            let events = startsEvents.concat(endsEvents).concat(goingEvents);

            let string = "";
            if(events != null)
                events.forEach(event => {
                    string += "**" + event.name + "** - " + channel.guild.roles.find(r => r.id == this.eventModule.getMentionableRolesIds()[event.role]) + "\n";
                });

            if(string == "")
                string = Translation.translate("command.event.check.week.no-event-found");

            datesInfo[date] = {"date": date, "data": string};
        });


        let embed = new Discord.RichEmbed()
            .setTitle(Translation.translate("command.event.check.week.title", ""))
            .setColor(0xbadc58)
            .setDescription(Translation.translate("command.event.check.description"));

        Object.keys(datesInfo).forEach(date => {
            embed.addField(Translation.translate("command.event.check.week." + datesInfo[date].date.isoWeekday()) + " " + datesInfo[date].date.format("D. M."), datesInfo[date].data);
        });

        channel.send(embed);
    }
    
    callNextweek(args, message) {
        let channel = message.channel;

        let mondayDay = moment();
        while (mondayDay.weekday() !== moment().day('Monday').weekday()){ 
            mondayDay.add(1, 'day'); 
        }

        let sundayDay = mondayDay.clone();
        while (sundayDay.weekday() !== moment().day('Sunday').weekday()){ 
            sundayDay.add(1, 'day'); 
        }

        let dates = this.getRangeOfDates(mondayDay, sundayDay, 'day');

        let datesInfo = {};
        dates.forEach(date => {
            let startsEvents = this.eventModule.getEventThatStartsInEnteredDay(date);
            let endsEvents = this.eventModule.getEventThatEndsInEnteredDay(date);
            let goingEvents = this.eventModule.getEventThatGoingInEnteredDay(date);
            let events = startsEvents.concat(endsEvents).concat(goingEvents);

            let string = "";
            if(events != null)
                events.forEach(event => {
                    string += "**" + event.name + "** - " + channel.guild.roles.find(r => r.id == this.eventModule.getMentionableRolesIds()[event.role]) + "\n";
                });

            if(string == "")
                string = Translation.translate("command.event.check.nextweek.no-event-found");

            datesInfo[date] = {"date": date, "data": string};
        });


        let embed = new Discord.RichEmbed()
            .setTitle(Translation.translate("command.event.check.nextweek.title", ""))
            .setColor(0xbadc58)
            .setDescription(Translation.translate("command.event.check.description"));

        Object.keys(datesInfo).forEach(date => {
            embed.addField(Translation.translate("command.event.check.week." + datesInfo[date].date.isoWeekday()) + " " + datesInfo[date].date.format("D. M."), datesInfo[date].data);
        });

        channel.send(embed);
    }
    
    getRangeOfDates(start, end, key, arr = [start.startOf(key)]) {
        if(start.isAfter(end)) 
            throw new Error('start must precede end')
        
        const next = moment(start).add(1, key).startOf(key);
        
        if(next.isAfter(end, key)) 
            return arr;
      
        return this.getRangeOfDates(next, end, key, arr.concat(next));
      }
      
}

module.exports = EventCommand;