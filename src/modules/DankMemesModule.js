const Module = require("./Module");

class DankMemesModule extends Module {

    getName() {
        return "dankmemesmodule";
    }

    init(client, settings, commands) {
        this.channel = client.channels.find(channel => channel.id === settings.channels["dank-memes"]);
    }

    event(name, args){
        if(name != "message")
            return;

        let message = args.message;
        
        if(message.channel.id != this.channel.id)
            return;

        if(message.attachments.array().length <= 0)
            return;

        let emoji = message.guild.emojis.find(emoji => emoji.name == "christ");

        message.react(emoji).catch(console.error);
    }

}

module.exports = DankMemesModule;