const Module = require("./Module");
const Discord = require('discord.js');
const fs = require('fs');

class RoleModule extends Module {

    getName() {
        return "rolemodule";
    }

    init(bot) {
        this.channel = bot.client.channels.find(channel => channel.id === bot.settings.channels["role"]);
        this.channelToRoles = bot.settings["channels-to-roles"];
        this.rolelockRole = bot.settings["rolelock-role"];
        this.roles = bot.settings.roles;
        
        this.channel.fetchMessages({ limit: 30 })
            .then(messages => {
                messages.forEach(message => {
                    if (message.content.includes("✅"))
                        return;

                    message.react("✅");
                });
            }).catch(console.error);
    }

    event(name, args){
        switch(name){
            case "messageReactionAdd":
                this.reactionAdd(args.reactionMessage, args.user);
                break;
            case "messageReactionRemove":
                this.reactionRemove(args.reactionMessage, args.user);
                break;
        }
    }

    reactionAdd(reactionMessage, user) {
        let message = reactionMessage.message;
        if (message.channel.id != this.channel.id)
            return;

        let guild = message.guild;
        var matches = [];
        message.content.replace(/\<#(.*?)\>/gm, function (m, p1) { matches.push(p1); });

        let channel = matches[0];
        let roleId = this.roles[this.channelToRoles[channel]];
        guild.fetchMember(user).then(member => {
            if(!this.canModifyRoles(member))
                return;
            
            if (member.roles.find(role => role.id == roleId) != undefined)
                return;

            member.addRole(roleId);
        }).catch(console.error);
    }

    reactionRemove(reactionMessage, user) {
        let message = reactionMessage.message;
        if (message.channel.id != this.channel.id)
            return;

        let guild = message.guild;
        var matches = [];
        message.content.replace(/\<#(.*?)\>/gm, function (m, p1) { matches.push(p1); });

        let channel = matches[0];
        let roleId = this.roles[this.channelToRoles[channel]];
        guild.fetchMember(user).then(member => {
            if(!this.canModifyRoles(member))
                return;
            
            if (member.roles.find(role => role.id == roleId) == undefined)
                return;

            member.removeRole(roleId);
        }).catch(console.error);
    }

    addRole(user, role, channel){
        let guild = channel.guild;

        guild.fetchMember(user).then(member => {
            if(!this.canModifyRoles(member))
                return;
            
            let roleId = this.roles[role];

            if(member.roles.find(r => r.id == roleId) != undefined){
                member.removeRole(roleId).catch(console.error);

                const embed = new Discord.RichEmbed()
                    .setTitle("✅ | Role odebrána")
                    .setDescription("Role " + role + " byla odebrána od tvého účtu.")
                    .setColor(0xe67e22);

                channel.send(embed);
            } else {
                member.addRole(roleId).catch(console.error);

                const embed = new Discord.RichEmbed()
                    .setTitle("✅ | Role přiřazena")
                    .setDescription("Role " + role + " byla přiřazena k tvému účtu.")
                    .setColor(0xe67e22);

                channel.send(embed);
            }
        }).catch(console.error);
    }

    printRoleList(channel){
        let list = "";
        let roles = channel.guild.roles;

        Object.keys(this.roles).forEach(shortcut => {
            let roleId = this.roles[shortcut];

            list += "`" + shortcut + "` - " + roles.find(role => role.id == roleId) + "\n";
        });

        let embed = new Discord.RichEmbed()
            .setTitle("👥 | Seznam rolí")
            .setDescription(list)
            .setColor(0xe67e22);

        channel.send(embed);
    }

    canModifyRoles(member){
        return member.roles.find(role => role.id == this.rolelockRole) == undefined;
    }

    isRole(name){
        return Object.keys(this.roles).includes(name);
    }

    canBeAssigned(name){
        return name != "member";
    }

}

module.exports = RoleModule;