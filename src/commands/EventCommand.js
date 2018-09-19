
const SubsCommand = require("./SubsCommand");
const moment = require('moment');

class EventCommand extends SubsCommand {

    getSubCommands() {
        return {
            "create": {
                "arguments": 7,
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
    }

    callCreate(args, message) {
        let channel = message.channel;

        let name, type, start, end, role, place, subject, description;
        if (args.length == 8) {
            [name, type, start, end, role, place, subject, description] = args;
        } else if(arg.length == 7) {
            [name, type, end, role, place, subject, description] = args;
            start = end;
        }

        if (!(moment(end, "D. M. YYYY").isValid() || moment(start, "D. M. YYYY").isValid()) || !(moment(end, "D. M. YYYY HH:mm").isValid() || moment(start, "D. M. YYYY HH:mm").isValid())) {
            this.sendError(channel, "command.event.wrong-date-format");
            return;
        }

        if (this.eventModule.exists(name)) {
            this.sendError(channel, "command.event.already-exists");
            return;
        }

        let types = ["event", "task"];
        if (!types.includes(type)) {
            this.sendError(channel, "command.event.type-not-valid", types.join(", "));
            return;
        }

        if (!this.eventModule.isMentionableRole(role)) {
            this.sendError(channel, "command.event.role-not-valid")
            return;
        }

        let files = [];
        message.attachments.array().forEach(messageAttachment => {
            files.push(messageAttachment.url);
        });

        this.eventModule.addEvent(name, type, start, end, role, place, subject, description, files);

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