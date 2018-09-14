const SubsCommand = require("./SubsCommand");
const Discord = require('discord.js');
const Translation = require("../Translation");

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
        }
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
        this.maxMuteLength = bot.settings.modules.mute.max;
        this.muteModule = bot.modules.mutemodule;
    }

    callList(args, message) {
        let channel = message.channel;

        this.muteModule.printRoleList(channel);
    }

    callAdd(args, message) {
        let channel = message.channel;

        let valid = [];
        channel.guild.members.forEach(member => {
            let name = member.nickname == undefined ? member.user.username : member.nickname;

            if (name.toLowerCase().includes(args[0].toLowerCase())) {
                valid.push(member);
            }
        });

        if (valid.length > 1) {
            let list = "";

            valid.forEach(member => {
                let name = member.nickname == undefined ? member.user.username : member.nickname;
                list += "\n**" + name + "**";
            });

            list += "\n";

            const embed = new Discord.RichEmbed()
                .setTitle("🔇 | " + Translation.translate("command.mute.user-list.title"))
                .setDescription(Translation.translate("command.mute.user-list") + ".\n" + list)
                .setColor(0xe67e22)

            channel.send(embed);
            return;
        } else if (valid.length <= 0) {
            this.sendError(channel, "command.mute.user-not-found");
            return;
        }

        let minutes = args[1];
        if (minutes <= 0 || minutes >= this.maxMuteLength) {
            this.sendError(channel, "command.mute.wrong-mute-length", this.maxMuteLength + ".");
            return;
        }

        let member = valid[0];

        if (member.user.id == message.author.id) {
            this.sendError(channel, "command.mute.self");
            return;
        }

        if (this.muteModule.isMuted(member)) {
            this.sendError(channel, "command.mute.already-muted");
            return;
        }

        if (!this.muteModule.canBeMuted(member)) {
            this.sendError(channel, "command.mute.moderator");
            return;
        }

        let reason = args[2];

        const embedDM = new Discord.RichEmbed()
            .setTitle("🔇 | " + Translation.translate("command.mute.user-muted-self.title"))
            .setDescription(Translation.translate("command.mute.user-muted-self"))
            .setColor(0xf0932b)
            .addField(Translation.translate("command.mute.time"), minutes + " " + Translation.translate("command.mute.minutes"), true)
            .addField(Translation.translate("command.mute.reason"), reason, false);

        const embed = new Discord.RichEmbed()
            .setTitle("🔇 | " + member.user.username + " " + Translation.translate("command.mute.user-muted.title"))
            .setDescription(Translation.translate("command.mute.user-muted") + " " + member.user.username + ".")
            .setColor(0xf0932b)
            .addField(Translation.translate("command.mute.time"), minutes + " " + Translation.translate("command.mute.minutes"), true)
            .addField(Translation.translate("command.mute.reason"), reason, false);

        member.createDM().then(channel => {
            channel.send(embedDM);
        });

        channel.send(embed);

        this.muteModule.addMute(member, minutes, reason);

        return true;
    }

    callRemove(args, message) {
        let channel = message.channel;
        if (args.length != 1) {
            this.sendHelp(channel);
            return;
        }

        let valid = [];
        channel.guild.members.forEach(member => {
            let name = member.nickname == undefined ? member.user.username : member.nickname;

            if (name.toLowerCase().includes(args[0].toLowerCase())) {
                valid.push(member);
            }
        });

        if (valid.length > 1) {
            let list = "";

            valid.forEach(member => {
                let name = member.nickname == undefined ? member.user.username : member.nickname;
                list += "\n**" + name + "**";
            });

            list += "\n";

            const embed = new Discord.RichEmbed()
                .setTitle("🔇 | " + Translation.translate("command.mute.user-list.title"))
                .setDescription(Translation.translate("command.mute.user-list") + ".\n" + list)
                .setColor(0xe67e22)

            channel.send(embed);
            return;
        } else if (valid.length <= 0) {
            this.sendError(channel, "command.mute.user-not-found");
            return;
        }

        let member = valid[0];

        if (!this.muteModule.isMuted(member)) {
            this.sendError(channel, "command.mute.not-muted");
            return;
        }

        this.muteModule.removeMute(member);

        const embed = new Discord.RichEmbed()
            .setTitle("🔇 | " + member.user.username + " " + Translation.translate("command.mute.unmuted.title"))
            .setDescription(member.user.username + " " + Translation.translate("command.mute.unmuted"))
            .setColor(0xbadc58);

        channel.send(embed);
        return true;
    }

}

module.exports = MuteCommand;