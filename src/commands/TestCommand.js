const Command = require("./Command");
const Discord = require('discord.js');
const CommandBuilder = require("../CommandBuilder");

class TestCommand extends Command {

    getName() {
        return "test";
    }

    getGroup() {
        return "manage";
    }

    init(bot) {
        this.client = bot.client;
    }

    call(args, message) {
        let channel = message.channel;
        
        let builder = new CommandBuilder(message.author, [
            {
                "title": "",
                "help": "",
                "validate": (content) => {
                    return false;
                }
            },
            {
                "title": "",
                "help": "",
                "validate": (content) => {
                    return true;
                }
            }
        ], channel);
        
        builder.start();

        return true;
    }

}

module.exports = TestCommand;