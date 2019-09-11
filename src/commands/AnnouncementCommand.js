const SubsCommand = require("./SubsCommand");
const CommandBuilder = require("../CommandBuilder");
const logger = require("../Logger");

class AnnouncementCommand extends SubsCommand {

    getSubCommands() {
        return {
            "create": {
                "arguments": 0,
                "roles": ["moderator"]
            },
            "list": {
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
            }
        };
    }

    getName() {
        return "annoucement";
    }

    getGroup() {
        return "manage";
    }

    getAliases() {
        return ["annouce"];
    }
    
    getDependencies() {
        return ["annoucementmodule"];
    }

    init(bot) {
        this.annoucementModule = bot.modules["annoucementmodule"];
    }

    callList(args, message) {
        this.annoucementModule.listAnnoucements(message.member);

        message.react("✅");
    }

    async callEdit(args, message) {
        const channel = message.channel;
        const types = ["title", "annoucement", "name"];

        const builder = new CommandBuilder("annoucement.edit", message.author, channel, [
            {
                "name": "name",
                "example": ["2392018", "botchanges"],
                "validate": async (content) => {
                    if (!await this.annoucementModule.annoucementExist(content)) 
                        return "command.annoucement.dont-exist";
                    else 
                        return true;
                    
                }
            },
            {
                "name": "type",
                "example": types,
                "commands": [
                    {
                        reaction: "🇹",
                        value: "title"
                    },
                    {
                        reaction: "🇦",
                        value: "annoucement"
                    },
                    {
                        reaction: "🇳",
                        value: "name"
                    }
                ],
                "validate": (content) => {
                    if (!types.includes(content)) 
                        return ["command.annoucement.edit-type-not-valid", types.join(", ")];
                    else
                        return true;
                }
            },
            {
                "name": "value",
                "example": "?",
                "validate": (content, values) => {
                    return true;
                }
            }
        ], (values) => {
            logger.info("User " + message.member.displayName + " edited annoucement with name " + values["name"] + ", edited " + values["type"] + " to " + values["value"] + ".");

            this.annoucementModule.editAnnoucement(message.member, values["name"], values["type"], values["value"]);
        });

        builder.start();
        return true;
    }

    async callDelete(args, message) {
        const channel = message.channel;
        const name = args[0];

        if (!await this.annoucementModule.annoucementExist(name)) {
            this.sendError(channel, "command.annoucement.dont-exist");
            return;
        }

        await this.annoucementModule.deleteAnnoucement(channel, name);

        return false;
    }

    async callCreate(args, message) {
        const channel = message.channel;

        const builder = new CommandBuilder("annoucement.create", message.author, channel, [
            {
                "name": "name",
                "example": ["2392018", "botchanges"],
                "validate": async (content) => {
                    if (await this.annoucementModule.annoucementExist(content)) 
                        return "command.annoucement.already-exists";
                    else 
                        return true;
                    
                }
            },
            {
                "name": "title",
                "example": ["Bot changes", "23. 9. 2018"],
                "validate": (content) => {
                    return true;
                }
            },
            {
                "name": "annoucement",
                "example": ["Annoucement..."],
                "validate": (content, values) => {
                    return true;
                }
            }
        ], async (values) => {
            logger.info("User " + message.member.displayName + " created annoucement with name " + values["name"] + ".");

            await this.annoucementModule.addAnnoucement(message.member, values["name"], values["title"], values["annoucement"]);
        });

        builder.start();
        return true;
    }

}

module.exports = AnnouncementCommand;
