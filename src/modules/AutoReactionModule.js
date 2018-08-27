const Module = require("./Module");

class AutoReactionModule extends Module {

    getName() {
        return "autoreactionmodule";
    }

    init(bot) {
        this.settings = bot.settings["auto-reaction"];
    }

    event(name, args){
        if(name != "message")
            return;

        let message = args.message;

        Object.keys(this.settings["channels-attachments"]).forEach(channelId => {
            let emoji = this.settings["channels-attachments"][channelId];

            if(message.attachments.array().length < 1)
                return;

            if(message.channel.id == channelId){
                message.react(emoji);
            }
        });

        Object.keys(this.settings.emojis).forEach(emoji => {
            let reactEmoji = this.settings.emojis[emoji];

            if(message.content.includes(emoji)){
                message.react(reactEmoji);
            }
        });
    }

}

module.exports = AutoReactionModule;