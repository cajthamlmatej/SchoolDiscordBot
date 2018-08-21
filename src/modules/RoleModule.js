const Module = require("./Module");
const Discord = require('discord.js');
const fs = require('fs');

class RoleModule extends Module {

    getName() {
        return "rolemodule";
    }

    init(client, settings, commands) {
        this.channel = client.channels.find(channel => channel.id === settings.channels["role"]);
        this.channelToRoles = settings["channels-to-roles"];
        
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
        if (reactionMessage.message.channel.id != this.channel.id)
            return;

        var matches = [];
        reactionMessage.message.content.replace(/\<#(.*?)\>/gm, function (m, p1) { matches.push(p1); });
        let channel = matches[0];

        let roleId = this.channelToRoles[channel];
        let member = reactionMessage.message.guild.members.find(user => user.id == user.id);

        if (member.roles.find(role => role.id == roleId) != undefined)
            return;

        let role = reactionMessage.message.guild.roles.find(role => role.id ==  roleId);

        member.addRole(role)
            .catch(console.error);
    }

    reactionRemove(reactionMessage, user) {
        if (reactionMessage.message.channel.id != this.channel.id)
            return;

        var matches = [];
        reactionMessage.message.content.replace(/\<#(.*?)\>/gm, function (m, p1) { matches.push(p1); });
        let channel = matches[0];

        let roleId = this.channelToRoles[channel];
        let member = reactionMessage.message.guild.members.find(user => user.id == user.id);

        if (member.roles.find(role => role.id == roleId) == undefined)
            return;

            let role = reactionMessage.message.guild.roles.find(role => role.id ==  roleId);

        member.removeRole(role)
            .catch(console.error);
    }

}

module.exports = RoleModule;