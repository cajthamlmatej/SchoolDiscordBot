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
            if(member.roles.find(role => role.id == this.rolelockRole) != undefined)
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
            if(member.roles.find(role => role.id == this.rolelockRole) != undefined)
                return;
            
            if (member.roles.find(role => role.id == roleId) == undefined)
                return;

            member.removeRole(roleId);
        }).catch(console.error);
    }

}

module.exports = RoleModule;