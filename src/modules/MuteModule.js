const Module = require("./Module");
const fs = require("fs");
const Discord = require("discord.js");
const moment = require("moment");
const Translation = require("../Translation");
const Config = require("../Config");

class MuteModule extends Module {

    getName() {
        return "mutemodule";
    }

    init(bot) {
        this.guild = bot.client.guilds.find("id", Config.get("bot.guild"));
        this.muteRole = Config.get("roles.special.mute");
        this.moderatorRole = Config.get("roles.permissions.moderator");

        this.tempFile = "./temp/mutes.json";

        this.tick();
        setInterval(() => this.tick(), 10000);
    }

    tick() {
        const mutes = this.getMutes();
        const toRemove = [];

        Object.keys(mutes).forEach(userId => {
            const mute = mutes[userId];
            const current = moment().format("X");
            const expiration = mute.expiration;

            if (current > expiration) {
                toRemove.push(userId);

                this.setMuteRoles(userId, mute.roles);
            }
        });

        this.removeMutesFromFile(toRemove);
    }

    printRoleList(channel) {
        const mutes = this.getMutes();

        const embed = new Discord.RichEmbed()
            .setTitle("🔇 | " + Translation.translate("module.mute.list"))
            .setColor(0xbadc58);

        let result = Promise.resolve();
        Object.keys(mutes).forEach(userId => {
            const mute = mutes[userId];
            result = result.then(() => {
                this.guild.fetchMember(userId).then(member => {
                    embed.addField(member.nickname, Translation.translate("module.mute.reason") + ": " + mute.reason + "\n" + Translation.translate("module.mute.expiration") + ": " + moment(mute.expiration, "X").format("D. M. Y H:m:s"));
                });
            });
        });

        result.then(() => {
            if (embed.fields.length <= 0)
                embed.setDescription(Translation.translate("module.mute.error"));

            channel.send(embed);
        });
    }

    addMute(member, lengthInMinutes, reason) {
        const mutes = fs.readFileSync(this.tempFile, "utf8");
        const mutesObject = JSON.parse(mutes);

        const expiration = moment().add(lengthInMinutes, "m").format("X");
        const roles = [];

        member.roles.forEach(role => {
            roles.push(role.id);
        });

        member.setRoles([this.muteRole]).then(member => {
            mutesObject["mutes"][member.user.id] = { expiration: expiration, reason: reason, roles: roles };

            fs.writeFileSync(this.tempFile, JSON.stringify(mutesObject));
        }).catch(console.error);
    }

    setMuteRoles(userId, muteRoles) {
        this.guild.fetchMember(userId).then(member => {
            member.setRoles(muteRoles);
        });

    }

    removeMute(member) {
        const mute = this.getMute(member.user.id);
        this.setMuteRoles(member.user.id, mute.roles);

        this.removeMuteFromFile(member.user.id);
    }

    getMutes() {
        const mutes = fs.readFileSync(this.tempFile, "utf8");
        const mutesObject = JSON.parse(mutes);

        return mutesObject["mutes"];
    }

    getMute(userId) {
        const mutes = fs.readFileSync(this.tempFile, "utf8");
        const mutesObject = JSON.parse(mutes);

        return mutesObject["mutes"][userId];
    }

    removeMuteFromFile(userId) {
        const mutes = fs.readFileSync(this.tempFile, "utf8");
        const mutesObject = JSON.parse(mutes);

        delete mutesObject["mutes"][userId];

        fs.writeFileSync(this.tempFile, JSON.stringify(mutesObject));
    }

    removeMutesFromFile(ms) {
        const mutes = fs.readFileSync(this.tempFile, "utf8");
        const mutesObject = JSON.parse(mutes);

        ms.forEach(mute => {
            delete mutesObject["mutes"][mute];
        });

        fs.writeFileSync(this.tempFile, JSON.stringify(mutesObject));
    }

    isMuted(member) {
        const mutes = fs.readFileSync(this.tempFile, "utf8");
        const mutesObject = JSON.parse(mutes);

        return mutesObject["mutes"][member.user.id] != undefined;
    }

    canBeMuted(member) {
        return member.roles.find(r => r.id == this.moderatorRole) == undefined;
    }

    event(name, args) {
    }

}

module.exports = MuteModule;