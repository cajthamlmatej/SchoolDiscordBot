const Module = require("./Module");
const Discord = require('discord.js');
const fs = require('fs');
const Translation = require("../Translation");

class RoleModule extends Module {

    getName() {
        return "rolemodule";
    }

    init(bot) {
        this.channel = bot.client.channels.find(channel => channel.id === bot.settings.channels.role);
        this.rolelockRole = bot.settings.roles.special.rolelock;
        this.roles = bot.settings.roles;
        
        this.channel.fetchMessages({ limit: 30 })
            .then(messages => {
                messages.forEach(message => {
                    if (message.mentions.roles.array().length == 0)
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

        if(message.mentions.roles.array().length == 0)
            return;

        let role = message.mentions.roles.first();
        let guild = message.guild;

        guild.fetchMember(user).then(member => {
            if(!this.canModifyRoles(member))
                return;
            
            if (member.roles.find(r => r.id == role.id) != undefined)
                return;

            member.addRole(role);
        }).catch(console.error);
    }

    reactionRemove(reactionMessage, user) {
        let message = reactionMessage.message;
        if (message.channel.id != this.channel.id)
            return;

        if(message.mentions.roles.array().length == 0)
            return;

        let role = message.mentions.roles.first();
        let guild = message.guild;

        guild.fetchMember(user).then(member => {
            if(!this.canModifyRoles(member))
                return;
            
            if (member.roles.find(r => r.id == role.id) == undefined)
                return;

            member.removeRole(role);
        }).catch(console.error);
    }

    addRole(user, role, channel){
        let guild = channel.guild;

        guild.fetchMember(user).then(member => {
            if(!this.canModifyRoles(member))
                return;
            
            let roleId = this.roles.assignable[role];

            if(member.roles.find(r => r.id == roleId) != undefined){
                member.removeRole(roleId).catch(console.error);

                const embed = new Discord.RichEmbed()
                    .setTitle("✅ | Role odebrána")
                    .setDescription("Role " + role + " byla odebrána od tvého účtu.")
                    .setColor(0xbadc58);

                channel.send(embed);
            } else {
                member.addRole(roleId).catch(console.error);

                const embed = new Discord.RichEmbed()
                    .setTitle("✅ | Role přiřazena")
                    .setDescription("Role " + role + " byla přiřazena k tvému účtu.")
                    .setColor(0xbadc58);

                channel.send(embed);
            }
        }).catch(console.error);
    }

    printRoleList(channel){
        let roles = channel.guild.roles;

        let embed = new Discord.RichEmbed()
            .setTitle("👥 | Seznam rolí")
            .setColor(0xbadc58);

        Object.keys(this.roles).forEach(groupName => {
            let list = "";
            
            let groupRoles = this.roles[groupName];
            
            Object.keys(groupRoles).forEach(roleName => {
                let roleId = groupRoles[roleName];
                list += "`" + roleName + "` - " + roles.find(r => r.id == roleId) + "\n";
            });

            embed.addField(Translation.translate("roles.group." + groupName), list);
        });


        channel.send(embed);
    }

    canModifyRoles(member){
        return member.roles.find(role => role.id == this.rolelockRole) == undefined;
    }

    isRole(name){
        return Object.keys(this.roles.assignable).includes(name);
    }

    canBeAssigned(name){
        return name != "member";
    }

}

module.exports = RoleModule;