const SubsCommand = require("./SubsCommand");

class TimeTableCommand extends SubsCommand {

    getName() {
        return "timetable";
    }

    getGroup() {
        return "school";
    }

    getDependencies() {
        return ["eventtimetablemodule"];
    }

    getSubCommands() {
        return {
            "refresh": {
                "arguments": 0,
                "roles": ["owner"]
            }
        };
    }

    init(bot) {
        this.timetableModule = bot.modules.eventtimetablemodule;
        this.client = bot.client;
    }

    call(args, message) {
        this.timetableModule.update();
        message.react("✅");
    }
}

module.exports = TimeTableCommand;