const Module = require("./Module");
const fs = require("fs");
const Discord = require("discord.js");
const moment = require("moment");
const Translation = require("../Translation");
const Config = require("../Config");

const muteRepository = require("../database/Database").getRepository("mute");

class MuteModule extends Module {

    getName() {
        return "mutemodule";
    }

    init(bot) {
        this.guild = bot.client.guilds.get(Config.get("bot.guild"));
        this.muteRole = Config.get("roles.special.mute");
        this.moderatorRole = Config.get("roles.permissions.moderator");

        this.tick();
        setInterval(() => this.tick(), 10000);
    }

    async tick() {
        const mutes = await this.getMutes();
        const toRemove = [];

        mutes.forEach(mute => {
            const current = moment().format("X");
            const expiration = mute.expiration;

            if (current > expiration) {
                toRemove.push(mute.user);

                this.setMuteRoles(mute.user, mute.roles);
            }
        });

        this.removeMutesFromFile(toRemove);
    }

    async printRoleList(channel) {
        const mutes = await this.getMutes();

        const embed = new Discord.RichEmbed()
            .setTitle("🔇 | " + Translation.translate("module.mute.list"))
            .setColor(0xbadc58);

        let result = Promise.resolve();
        mutes.forEach(mute => {
            result = result.then(() => {
                this.guild.fetchMember(mute.user).then(member => {
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
        const expiration = moment().add(lengthInMinutes, "m").format("X");
        const roles = [];

        member.roles.forEach(role => {
            roles.push(role.id);
        });

        member.setRoles([this.muteRole]).then(async (member) => {
            await muteRepository.insert({
                expire: expiration,
                user: member.user.id,
                roles: roles,
                reason: reason
            });
        }).catch(console.error);
    }

    setMuteRoles(user, muteRoles) {
        this.guild.fetchMember(user).then(member => {
            member.setRoles(muteRoles);
        });
    }

    async removeMute(member) {
        const mute = await this.getMute(member.user.id);
        this.setMuteRoles(member.user.id, mute.roles);

        await this.removeMuteFromFile(member.user.id);
    }

    async getMutes() {
        return await muteRepository.getMutes();
    }

    async getMute(user) {
        return await muteRepository.getMute(user);
    }

    async removeMuteFromFile(user) {
        await muteRepository.deleteMute(user);
    }

    removeMutesFromFile(users) {
        users.forEach(user => {
            this.removeMuteFromFile(user);
        });
    }

    async isMuted(member) {
        return await muteRepository.isMuted(member.user.id);
    }

    canBeMuted(member) {
        return member.roles.find(r => r.id == this.moderatorRole) == undefined;
    }

    event(name, args) {
    }

}

module.exports = MuteModule;