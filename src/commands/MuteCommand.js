const SubsCommand = require("./SubsCommand");
const Discord = require("discord.js");
const Translation = require("../Translation");
const Config = require("../Config");

class MuteCommand extends SubsCommand {

    getSubCommands() {
        return {
            "remove": {
                "arguments": 1,
                "roles": ["moderator"]
            },
            "add": {
                "arguments": 3,
                "roles": ["moderator"]
            },
            "list": {
                "arguments": 0,
                "roles": ["moderator"]
            }
        };
    }

    getName() {
        return "mute";
    }

    getGroup() {
        return "manage";
    }

    getDependencies() {
        return ["mutemodule"];
    }

    init(bot) {
        this.maxMuteLength = Config.get("modules.mute.max");
        this.muteModule = bot.modules.mutemodule;
    }

    async callList(args, message) {
        const channel = message.channel;

        await this.muteModule.printRoleList(channel);
    }

    async callAdd(args, message) {
        const channel = message.channel;

        const valid = [];
        channel.guild.members.forEach(member => {
            const name = member.displayName;

            if (name.toLowerCase().includes(args[0].toLowerCase())) 
                valid.push(member);
            
        });

        if (valid.length > 1) {
            let list = "";

            valid.forEach(member => {
                list += "\n**" + member.displayName + "**";
            });

            list += "\n";

            const embed = new Discord.RichEmbed()
                .setTitle("🔇 | " + Translation.translate("command.mute.user-list.title"))
                .setDescription(Translation.translate("command.mute.user-list") + ".\n" + list)
                .setColor(Config.getColor("WARNING"));

            channel.send(embed);
            return;
        } else if (valid.length <= 0) {
            this.sendError(channel, "command.mute.user-not-found");
            return;
        }

        const minutes = args[1];
        if (minutes <= 0 || minutes >= this.maxMuteLength) {
            this.sendError(channel, "command.mute.wrong-mute-length", this.maxMuteLength);
            return;
        }

        const member = valid[0];

        if (member.user.id == message.author.id) {
            this.sendError(channel, "command.mute.self");
            return;
        }

        if (await this.muteModule.isMuted(member)) {
            this.sendError(channel, "command.mute.already-muted");
            return;
        }

        if (!await this.muteModule.canBeMuted(member)) {
            this.sendError(channel, "command.mute.moderator");
            return;
        }

        const reason = args[2];

        const embedDM = new Discord.RichEmbed()
            .setTitle("🔇 | " + Translation.translate("command.mute.user-muted-self.title"))
            .setDescription(Translation.translate("command.mute.user-muted-self"))
            .setColor(Config.getColor("SUCCESS"))
            .addField(Translation.translate("command.mute.time"), Translation.translate("command.mute.minutes", minutes), true)
            .addField(Translation.translate("command.mute.reason"), reason, false);

        const embed = new Discord.RichEmbed()
            .setTitle("🔇 | " + Translation.translate("command.mute.user-muted.title", member.displayName))
            .setDescription(Translation.translate("command.mute.user-muted", member.displayName))
            .setColor(Config.getColor("WARNING"))
            .addField(Translation.translate("command.mute.time"), Translation.translate("command.mute.minutes", minutes), true)
            .addField(Translation.translate("command.mute.reason"), reason, false);

        member.createDM().then(channel => {
            channel.send(embedDM);
        });

        channel.send(embed);

        await this.muteModule.addMute(member, minutes, reason);
    }

    async callRemove(args, message) {
        const channel = message.channel;
        if (args.length != 1) {
            this.sendHelp(channel);
            return;
        }

        const valid = [];
        channel.guild.members.forEach(member => {
            const name = member.displayName;

            if (name.toLowerCase().includes(args[0].toLowerCase())) 
                valid.push(member);
            
        });

        if (valid.length > 1) {
            let list = "";

            valid.forEach(member => {
                list += "\n**" + member.displayName + "**";
            });

            list += "\n";

            const embed = new Discord.RichEmbed()
                .setTitle("🔇 | " + Translation.translate("command.mute.user-list.title"))
                .setDescription(Translation.translate("command.mute.user-list") + ".\n" + list)
                .setColor(Config.getColor("WARNING"));

            channel.send(embed);
            return;
        } else if (valid.length <= 0) {
            this.sendError(channel, "command.mute.user-not-found");
            return;
        }

        const member = valid[0];

        if (!await this.muteModule.isMuted(member)) {
            this.sendError(channel, "command.mute.not-muted");
            return;
        }

        await this.muteModule.removeMute(member);

        const embed = new Discord.RichEmbed()
            .setTitle("🔇 | " + Translation.translate("command.mute.unmuted.title", member.displayName))
            .setDescription(Translation.translate("command.mute.unmuted", member.displayName))
            .setColor(Config.getColor("SUCCESS"));

        channel.send(embed);
    }

}

module.exports = MuteCommand;