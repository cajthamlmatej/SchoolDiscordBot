
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
            [name, type, start, end, role, place, subject, description] = args;
        } else {
            [name, type, end, role, place, subject, description] = args;
            start = end;
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

    callEdit(args, channel) {
        let name = args[0];
        let type = args[1];
        let value = args[2];

        if (!this.eventModule.exists(name)) {
            this.sendError(channel, "command.event.dont-exist");
            return;
        }

        let types = ["type", "start", "end", "role", "place", "subject", "description"];
        if (!types.includes(type)) {
            this.sendError(channel, "command.event.edit-type-not-valid", types.join(", "));
            return;
        }

        if(type == "type"){
            let eventTypes = ["event", "task"];
            if (!eventTypes.includes(value)) {
                this.sendError(channel, "command.event.type-not-valid", eventTypes.join(", "));
                return;
            }
        } else if(type == "role"){
            if (!this.eventModule.isMentionableRole(value)) {
                this.sendError(channel, "command.event.role-not-valid")
                return;
            }
        } 

        this.eventModule.editEvent(name, type, value);

        return true;
    }

    callDelete(args, channel){
        let name = args[0];

        if (!this.eventModule.exists(name)) {
            this.sendError(channel, "command.event.dont-exist");
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