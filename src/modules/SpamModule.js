const Module = require("./Module");
const Discord = require('discord.js');
const Translation = require("../Translation");

class SpamModule extends Module {

    getName() {
        return "spammodule";
    }

    init(bot) {
        this.tick();
        setInterval(() => this.tick(), 1800000);
    }

    tick() {
    }

    event(name, args) {
        if (name != "message")
            return;

        let message = args[0];
    }

}

module.exports = SpamModule;