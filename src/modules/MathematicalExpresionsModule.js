const Module = require("./Module");
const { create, all } = require("mathjs");
const Translation = require("../Translation");
const math = create(all, {});

class MathematicalExpresionsModule extends Module {

    getName() {
        return "mathematicalexpresionsmodule";
    }

    init(bot) {
    }

    event(name, args) {
        if (name != "message")
            return;

        let message = args.message;

        if (message.author.bot)
            return;

        try {
            let question = math.evaluate(message.content.toLowerCase());

            if (question != undefined && question != message.content && !(question instanceof Function)) {
                message.channel.send(Translation.translate("module.math.result") + question);
            }
        }
        catch (err) {

        }
    }
}

module.exports = MathematicalExpresionsModule;