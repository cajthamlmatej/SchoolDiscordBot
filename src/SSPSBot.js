const Discord = require('discord.js');

class SSPSBot {
    constructor(settings, commands, modules) {
        this.token = settings.token;
        this.settings = settings;
        this.commands = commands;
        this.modules = modules;
        
        this.client = new Discord.Client();
    }

    login() {
        console.log("Setting bot event's.");

        this.client.on("ready", () => {
            this.ready();
        });
        this.client.on("message", (message) => {
            if(message.guild == null || message.guild.id != this.settings.guild)
                return;

            this.message(message);
            Object.values(this.modules).forEach(module => {
                module.event("message", {message: message});
            })
        });
        this.client.on("messageReactionAdd", (reactionMessage, user) => {
            if(reactionMessage.message.guild == null || reactionMessage.message.guild.id != this.settings.guild)
                return;

            Object.values(this.modules).forEach(module => {
                module.event("messageReactionAdd", {reactionMessage: reactionMessage, user: user});
            })
        });
        this.client.on("messageReactionRemove", (reactionMessage, user) => {
            if(reactionMessage.message.guild == null || reactionMessage.message.guild.id != this.settings.guild)
                return;

            Object.values(this.modules).forEach(module => {
                module.event("messageReactionRemove", {reactionMessage: reactionMessage, user: user});
            })
        });
        
        console.log("Starting bot.");
        this.client.login(this.token);
    }

    ready() {
        this.name = this.client.user.username;
        console.log("Initialiazing commands and modules");

        Object.values(this.commands).forEach(command => {
            console.log("Init command " + command.getName());
            command.init(this); 
        });
        Object.values(this.modules).forEach(module => {
            console.log("Init module " + module.getName());
            module.init(this); 
        })

        console.log("Bot " + this.name + " started.");
    }

    message(message) {
        if(!message.content.startsWith(this.settings.prefix))
            return;

        if(message.author.id == this.client.user.id)
            return;

        let args = message.content.match(/[^\s"']+|"([^"]*)"|'([^']*)'/gm);

        let cmd = args[0].replace(this.settings.prefix, "").toLowerCase();
        let command = this.commands[cmd];

        if(command == undefined)
            return;
        
        let roles = command.getRoles();
        let havePermissions = false;
        let guild = message.guild;
        guild.fetchMember(message.author)
            .then(member => {
                roles.forEach(r => {
                    if(member.roles.find(role => role.id == this.settings[r + "-role"]))
                        havePermissions = true;
                });
        
                if(!havePermissions)
                    return;
        
                args.shift();
                for(var i = 0; i < args.length; i++)
                {
                    args[i] = args[i].replace(/"/gm, '').replace(/'/gm, '');
                }
                
                let deleteMessage = this.commands[cmd].call(args, message.channel, message.author, message);
        
                if(deleteMessage)
                    message.delete();
            }).catch(console.error);
    }
}

module.exports = SSPSBot;