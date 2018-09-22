
const SubsCommand = require("./SubsCommand");
const moment = require('moment');
const CommandBuilder = require("../CommandBuilder");

class EventCommand extends SubsCommand {

    getSubCommands() {
        return {
            "create": {
                "arguments": 0,
                "roles": ["moderator"]
            },
            "edit": {
                "arguments": 3,
                "roles": ["moderator"]
            },
            "delete": {
                "arguments": 1,
                "roles": ["moderator"]
            },
            "list": {
                "arguments": 0,
                "roles": ["moderator"]
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
    }

    callCreate(args, message) {
        let channel = message.channel;
        let types = ["event", "task"];

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
                "example": "stp_ukol_potreby",
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
                "example": ["13. 9. 2018", "13. 9. 2018 8:00"],
                "validate": (content) => {
                    if (!(moment(content, "D. M. YYYY").isValid() || moment(content, "D. M. YYYY").isValid())) {
                        return "command.event.wrong-date-format";
                    } else
                        return true;
                }
            },
            {
                "name": "end",
                "example": ["-", "15. 9. 2018", "15. 9. 2018 13:30"],
                "validate": (content) => {
                    if (content == "-")
                        return true;

                    if (!(moment(content, "D. M. YYYY").isValid() || moment(content, "D. M. YYYY").isValid())) {
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
            }
        ], (values) => {
            let files = [];
            message.attachments.array().forEach(messageAttachment => {
                files.push(messageAttachment.url);
            });

            console.log("User " + message.author.username + " created event with name " + values["name"]);
            this.eventModule.addEvent(values["name"], values["type"], values["start"], values["end"], values["role"], values["place"], values["subject"], values["description"], files);
        }, this.stopWord);

        builder.start();
        return true;
    }

    callEdit(args, message) {
        let channel = message.channel;

        let [name, type, value] = args;

        if (!this.eventModule.exists(name)) {
            this.sendError(channel, "command.event.dont-exist");
            return;
        }

        let types = ["type", "start", "end", "role", "place", "subject", "description"];
        if (!types.includes(type)) {
            this.sendError(channel, "command.event.edit-type-not-valid", types.join(", "));
            return;
        }

        if (type == "type") {
            let eventTypes = ["event", "task"];
            if (!eventTypes.includes(value)) {
                this.sendError(channel, "command.event.type-not-valid", eventTypes.join(", "));
                return;
            }
        } else if (type == "role") {
            if (!this.eventModule.isMentionableRole(value)) {
                this.sendError(channel, "command.event.role-not-valid")
                return;
            }
        }

        this.eventModule.editEvent(name, type, value);

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
}

module.exports = EventCommand;