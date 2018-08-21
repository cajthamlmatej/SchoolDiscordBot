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
            this.message(message);
            Object.values(this.modules).forEach(module => {
                module.event("message", {message: message});
            })
        });
        this.client.on("messageReactionAdd", (reactionMessage, user) => {
            Object.values(this.modules).forEach(module => {
                module.event("messageReactionAdd", {reactionMessage: reactionMessage, user: user});
            })
        });
        this.client.on("messageReactionRemove", (reactionMessage, user) => {
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
            command.init(this.client, this.settings, this.commands); 
        });
        Object.values(this.modules).forEach(module => {
            console.log("Init module " + module.getName());
            module.init(this.client, this.settings, this.commands); 
        })

        console.log("Bot " + this.name + " started.");
    }

    message(message) {
        if(message.author.id == this.client.user.id)
            return;

        if(message.channel.id != this.settings.channels["admin-bot"])
            return;

        if(!message.content.startsWith(this.settings.prefix)){
            //message.delete();
            return;
        }
        
        let args = message.content.match(/[^\s"']+|"([^"]*)"|'([^']*)'/gm);

        let cmd = args[0].replace(this.settings.prefix, "");

        if(this.commands[cmd] == undefined){
            //message.delete();
            return;
        }

        args.shift();
        for(var i = 0; i < args.length; i++)
        {
            args[i] = args[i].replace(/"/gm, '').replace(/'/gm, '');
        }
        
        let deleteMessage = this.commands[cmd].call(args);

        if(deleteMessage)
            message.delete();
    }
}

module.exports = SSPSBot;