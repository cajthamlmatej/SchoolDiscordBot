const Module = require("./Module");
const Config = require("../Config");

class AutomaticVoiceModule extends Module {

    getName() {
        return "automaticvoicemodule";
    }

    init(bot) {
        this.guild = bot.client.guilds.get(Config.get("bot.guild"));
        this.createChannelId = Config.get("modules.automatic-voice.create-channel");
        this.name = Config.get("modules.automatic-voice.name");
        this.createChannel = bot.client.channels.find(ch => ch.id == this.createChannelId);
        this.bot = bot;
    
        this.guild.channels.forEach(channel => {
            if(channel.type != "voice") 
                return;

            if(channel.name != this.name)
                return;

            if(channel.members.size > 0)
                return;

            channel.delete();
        });
    }

    event(name, args) {
        if(name != "voiceStateUpdate")
            return;

        if(args.oldMember.voiceChannelID == undefined && args.newMember.voiceChannelID == this.createChannelId) {
            this.createChannel.clone(this.name).then(channel => {
                channel.setParent(this.createChannel.parentID).then(channel => {
                    args.newMember.setVoiceChannel(channel);
                });
            });

            return;
        }

        if(args.oldMember.voiceChannelID != undefined) {
            const voiceChannel = this.bot.client.channels.find(ch => ch.id == args.oldMember.voiceChannelID);
            
            if(voiceChannel != null && voiceChannel != undefined) {
                if(voiceChannel.name != this.name)
                    return;

                if(voiceChannel.members.size > 0)
                    return;

                voiceChannel.delete();
            }
        }
    }

}

module.exports = AutomaticVoiceModule;