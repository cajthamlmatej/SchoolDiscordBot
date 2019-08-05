const Module = require("./Module");
const Discord = require("discord.js");
const moment = require("moment");
const Translation = require("../Translation");
const Config = require("../Config");
const logger = require("../Logger");

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
            const expiration = mute.expire;
            if (current > expiration) {
                toRemove.push(mute.user);

                this.setMuteRoles(mute.user, mute.roles);
            }
        });

        this.removeMutesFromDatabase(toRemove);
    }

    async printRoleList(channel) {
        const mutes = await this.getMutes();

        const embed = new Discord.RichEmbed()
            .setTitle("🔇 | " + Translation.translate("module.mute.list"))
            .setColor(Config.getColor("SUCCESS"));

        let result = Promise.resolve();
        mutes.forEach(mute => {
            result = result.then(() => {
                this.guild.fetchMember(mute.user).then(member => {
                    embed.addField(member.displayName, Translation.translate("module.mute.reason") + ": " + mute.reason + "\n" + Translation.translate("module.mute.expiration") + ": " + moment(mute.expiration, "X").format("D. M. Y H:m:s"));
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
        }).catch(logger.error);
    }

    setMuteRoles(user, muteRoles) {
        this.guild.fetchMember(user).then(member => {
            member.setRoles(muteRoles);
        });
    }

    async removeMute(member) {
        const mute = await this.getMute(member.user.id);
        this.setMuteRoles(member.user.id, mute.roles);

        await this.removeMuteFromDatabase(member.user.id);
    }

    async getMutes() {
        return await muteRepository.getMutes();
    }

    async getMute(user) {
        return await muteRepository.getMute(user);
    }

    async removeMuteFromDatabase(user) {
        await muteRepository.deleteMute(user);
    }

    async removeMutesFromDatabase(users) {
        users.forEach(async (user) => {
            await this.removeMuteFromDatabase(user);
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