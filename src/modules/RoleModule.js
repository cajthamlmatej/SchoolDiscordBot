const Module = require("./Module");
const Discord = require("discord.js");
const Translation = require("../Translation");
const Config = require("../Config");
const logger = require("../Logger");

class RoleModule extends Module {

    getName() {
        return "rolemodule";
    }

    init(bot) {
        this.channel = bot.client.channels.find(channel => channel.id === Config.get("channels.role"));
        this.rolelockRole = Config.get("roles.special.rolelock");
        this.roles = Config.get("roles");

        this.channel.fetchMessages({ limit: 30 })
            .then(messages => {
                messages.forEach(message => {
                    if (message.mentions.roles.array().length == 0)
                        return;

                    message.react("✅");
                });
            }).catch(logger.error);
    }

    event(name, args) {
        switch (name) {
        case "messageReactionAdd":
            this.reactionAdd(args.reactionMessage, args.user);
            break;
        case "messageReactionRemove":
            this.reactionRemove(args.reactionMessage, args.user);
            break;
        }
    }

    reactionAdd(reactionMessage, user) {
        const message = reactionMessage.message;
        if (message.channel.id != this.channel.id)
            return;

        if (message.mentions.roles.array().length == 0)
            return;

        const role = message.mentions.roles.first();
        const guild = message.guild;

        guild.fetchMember(user).then(member => {
            if (!this.canModifyRoles(member))
                return;

            if (member.roles.find(r => r.id == role.id) != undefined)
                return;

            member.addRole(role);
        }).catch(logger.error);
    }

    reactionRemove(reactionMessage, user) {
        const message = reactionMessage.message;
        if (message.channel.id != this.channel.id)
            return;

        if (message.mentions.roles.array().length == 0)
            return;

        const role = message.mentions.roles.first();
        const guild = message.guild;

        guild.fetchMember(user).then(member => {
            if (!this.canModifyRoles(member))
                return;

            if (member.roles.find(r => r.id == role.id) == undefined)
                return;

            member.removeRole(role);
        }).catch(logger.error);
    }

    updateRole(user, role, channel) {
        const guild = channel.guild;

        guild.fetchMember(user).then(member => {
            if (!this.canModifyRoles(member))
                return;

            const roleId = this.roles.assignable[role];

            if (member.roles.find(r => r.id == roleId) != undefined) {
                member.removeRole(roleId).catch(logger.error);

                const embed = new Discord.RichEmbed()
                    .setTitle("✅ | " + Translation.translate("module.role.deleted"))
                    .setDescription("")
                    .setColor(Config.getColor("SUCCESS"));

                channel.send(embed);
            } else {
                member.addRole(roleId).catch(logger.error);

                const embed = new Discord.RichEmbed()
                    .setTitle("✅ | " + Translation.translate("module.role.added"))
                    .setDescription("")
                    .setColor(Config.getColor("SUCCESS"));

                channel.send(embed);
            }
        }).catch(logger.error);
    }

    printRoleList(channel) {
        const roles = channel.guild.roles;

        const embed = new Discord.RichEmbed()
            .setTitle("👥 | " + Translation.translate("module.role.list"))
            .setColor(Config.getColor("SUCCESS"));

        Object.keys(this.roles).forEach(groupName => {
            let list = "";

            const groupRoles = this.roles[groupName];

            Object.keys(groupRoles).forEach(roleName => {
                const roleId = groupRoles[roleName];
                list += "`" + roleName + "` - " + roles.find(r => r.id == roleId) + "\n";
            });

            embed.addField(Translation.translate("roles.group." + groupName), list);
        });

        channel.send(embed);
    }

    canModifyRoles(member) {
        return member.roles.find(role => role.id == this.rolelockRole) == undefined;
    }

    isRole(name) {
        return Object.keys(this.roles.assignable).includes(name);
    }

    canBeAssigned(name) {
        return name != "member";
    }

}

module.exports = RoleModule;