
const SubsCommand = require("./SubsCommand");

class EventCommand extends SubsCommand {

    getSubCommands() {
        return {
            "create": {
                "arguments": 7,
                "help": "<name> <event/task> [start] <end> <role> <place> <subject> <description>"
            },
            "edit": {
                "arguments": 3,
                "help": "<name> <type/start/end/role/place/subject/description> <value>"
            },
            "delete": {
                "arguments": 1,
                "help": "<name>"
            },
            "list": {
                "arguments": 0,
                "help": ""
            }
        }
    }

    getName() {
        return "event";
    }

    getGroup() {
        return "school";
    }

    getHelp() {
        return "Command for managing events."
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

    callCreate(args, channel, author, message) {
        let name, type, start, end, role, place, subject, description;
        if (args.length == 8) {
            name = args[0];
            type = args[1];
            start = args[2];
            end = args[3];
            role = args[4];
            place = args[5];
            subject = args[6];
            description = args[7];
        } else {
            name = args[0];
            type = args[1];
            start = args[2];
            end = args[2];
            role = args[3];
            place = args[4];
            subject = args[5];
            description = args[6];
        }

        if (this.eventModule.exists(name)) {
            this.sendError(channel, "Event with this name already exists, please choose different name.");
            return;
        }

        let types = ["event", "task"];
        if (!types.includes(type)) {
            this.sendError(channel, "Selected type of event is not valid, must be one of: " + types.join(", "));
            return;
        }

        if (!this.eventModule.isMentionableRole(role)) {
            this.sendError(channel, "Selected role is not valid, choose one of *mentionable* in command `rolelist`.")
            return;
        }

        let files = [];
        message.attachments.array().forEach(messageAttachment => {
            files.push(messageAttachment.url);
        });

        this.eventModule.addEvent(name, type, start, end, role, place, subject, description, files);

        return true;
    }

    callEdit(args, channel) {
        let name = args[0];
        let type = args[1];
        let value = args[2];

        if (!this.eventModule.exists(name)) {
            this.sendError(channel, "Event with this name dont exists.");
            return;
        }

        let types = ["type", "start", "end", "role", "place", "subject", "description"];
        if (!types.includes(type)) {
            this.sendError(channel, "Selected type of value is not valid, must be one of: " + types.join(", "));
            return;
        }

        if(type == "type"){
            let eventTypes = ["event", "task"];
            if (!eventTypes.includes(value)) {
                this.sendError(channel, "Selected type of event is not valid, must be one of: " + eventTypes.join(", "));
                return;
            }
        } else if(type == "role"){
            if (!this.eventModule.isMentionableRole(value)) {
                this.sendError(channel, "Selected role is not valid, choose one of *mentionable* in command `rolelist`.")
                return;
            }
        } 

        this.eventModule.editEvent(name, type, value);

        return true;
    }

    callDelete(args, channel){
        let name = args[0];

        if (!this.eventModule.exists(name)) {
            this.sendError(channel, "Event with this name dont exists.");
            return;
        }

        this.eventModule.deleteEvent(name);

        return true;
    }

    callList(args, channel, author){
        this.eventModule.printEventList(author);

        return true;
    }
}

module.exports = EventCommand;