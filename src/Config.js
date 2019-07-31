const config = require("config");
        
class Config {

    validate() {
        if(process.env.NODE_ENV == undefined)
            throw new Error("You are using default node enviroment. Please read README.md, change config and node enviroment.");

        this.getRequiredPaths().forEach(path => {
            if(!config.has(path))
                throw new Error("Path " + path + " is required in config.");
        });
    }

    getRequiredPaths() {
        return [
            "bot.token",
            "bot.prefix",
            "bot.guild",
            "bot.language",

            "bot.limit.command-usage",
            "bot.builder.stop-word",

            "roles.permissions.owner",
            "roles.permissions.admin",
            "roles.permissions.moderator",
            "roles.permissions.member",

            "roles.mentionable.member",

            "channels.annoucement",
            "channels.bakalari",
            "channels.supplementation",
            "channels.event",
            "channels.event-archive",
            "channels.vote",
            "channels.bot-info",

            "modules.disabled",

            "modules.event.archive-days",
            "modules.event.check-time",
            "modules.event.placeholders",

            "modules.auto-reaction.text-text",
            "modules.auto-reaction.channels-attachments",
            "modules.auto-reaction.text",
            "modules.auto-reaction.series-text",

            "commands.disabled"
        ];
    }

    get(path) {
        if(config.has(path))
            return config.get(path);
        else 
            return undefined;
    }

}

const conf = new Config();

module.exports = conf;