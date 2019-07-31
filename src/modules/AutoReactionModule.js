const Module = require("./Module");
const Config = require("../Config");

class AutoReactionModule extends Module {

    getName() {
        return "autoreactionmodule";
    }

    init(bot) {
        this.settings = Config.get("modules.auto-reaction");
    }

    event(name, args) {
        if (name != "message")
            return;

        const message = args.message;

        if(message.author.bot) 
            return;

        Object.keys(this.settings["channels-attachments"]).forEach(channelId => {
            const emoji = this.settings["channels-attachments"][channelId];

            if (message.attachments.array().length < 1)
                return;

            if (message.channel.id == channelId) 
                message.react(emoji);
            
        });

        Object.keys(this.settings.text).forEach(text => {
            const reactEmoji = this.settings.text[text];

            if (message.content.toLowerCase().includes(text)) 
                message.react(reactEmoji);
            
        });

        Object.keys(this.settings["series-text"]).forEach(text => {
            const emojis = this.settings["series-text"][text];

            if (message.content.toLowerCase().includes(text)) {
                let result = Promise.resolve();
                emojis.forEach(emoji => {
                    result = result.then(() => message.react(emoji));
                });
            }
        });

        Object.keys(this.settings["text-text"]).forEach(text => {
            const s = this.settings["text-text"][text];

            if (message.content.toLowerCase().includes(text)) 
                message.channel.send(s);
            
        });
    }

}

module.exports = AutoReactionModule;