const Module = require("./Module");

class AutoReactionModule extends Module {

    getName() {
        return "autoreactionmodule";
    }

    init(bot) {
        this.settings = bot.settings.modules["auto-reaction"];
    }

    event(name, args) {
        if (name != "message")
            return;

        let message = args.message;

        Object.keys(this.settings["channels-attachments"]).forEach(channelId => {
            let emoji = this.settings["channels-attachments"][channelId];

            if (message.attachments.array().length < 1)
                return;

            if (message.channel.id == channelId) {
                message.react(emoji);
            }
        });

        Object.keys(this.settings.text).forEach(text => {
            let reactEmoji = this.settings.text[text];

            if (message.content.toLowerCase().includes(text)) {
                message.react(reactEmoji);
            }
        });

        Object.keys(this.settings["series-text"]).forEach(text => {
            let emojis = this.settings["series-text"][text];

            if (message.content.toLowerCase().includes(text)) {
                let result = Promise.resolve();
                emojis.forEach(emoji => {
                    result = result.then(() => message.react(emoji));
                });
            }
        });
    }

}

module.exports = AutoReactionModule;