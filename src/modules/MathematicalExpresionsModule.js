const Module = require("./Module");
const { create, all } = require("mathjs");
const Translation = require("../Translation");
const math = create(all, {});

class MathematicalExpresionsModule extends Module {

    getName() {
        return "mathematicalexpresionsmodule";
    }

    init(bot) {}

    event(name, args) {
        if (name != "message")
            return;

        const message = args.message;

        if (message.author.bot)
            return;

        try {
            const question = math.evaluate(message.content.toLowerCase());
            if (question != undefined && question != message.content && !(question instanceof Function) && !message.content.includes("\""))
                message.channel.send(Translation.translate("module.math.result") + question);
        } catch (err) {
            // We dont want to do anything
        }
    }
}

module.exports = MathematicalExpresionsModule;