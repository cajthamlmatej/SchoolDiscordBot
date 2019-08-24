const config = require("config");

class Config {

    validate() {
        if (process.env.NODE_ENV == undefined)
            throw new Error("You are using default node enviroment. Please read README.md, change config and node enviroment.");

        this.getRequiredPaths().forEach(path => {
            if (!config.has(path))
                throw new Error("Path " + path + " is required in config.");
        });

        const colors = ["success", "fail", "warning", "special"];
        this.colors = {
            SUCCESS: 0xb8e994,
            FAIL: 0xe55039,
            WARNING: 0xfa983a,
            SPECIAL: 0x000000
        };

        colors.forEach(color => {
            if(config.has("colors." + color)) 
                this.colors[color.toUpperCase()] = config.get("colors." + color);
            
        });
    }

    getColor(type) {
        type = type.toUpperCase();
        
        return this.colors[type];
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
            
            "roles.assignable",

            "roles.special.mute",
            "roles.special.rolelock",

            "channels.annoucement",
            "channels.bakalari",
            "channels.supplementation",
            "channels.role",
            "channels.event",
            "channels.event-archive",
            "channels.vote",
            "channels.bot-info",

            "modules.disabled",

            "modules.event.archive-days",
            "modules.event.check-time",
            "modules.event.placeholders",

            "modules.automatic-reaction",

            "modules.event-annoucement.check-time",

            "modules.mute.max",

            "modules.automatic-voice.create-channel",
            "modules.automatic-voice.name",

            "commands.disabled",

            "commands.weather.degree",
        ];
    }

    get(path) {
        if (config.has(path))
            return config.get(path);
        else
            return undefined;
    }

}

const conf = new Config();

module.exports = conf;