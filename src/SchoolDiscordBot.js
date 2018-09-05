const Discord = require('discord.js');

class SchoolDiscordBot {
    constructor(settings, commands, modules) {
        this.token = settings.token;
        this.settings = settings;
        this.commands = commands;
        this.modules = modules;
        this.commandsAliases = {};
        
        this.client = new Discord.Client();
    }

    login() {
        console.log("Setting bot events.");

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
        
        console.log("Login bot to discord.");
        this.client.login(this.token);
    }

    ready() {
        this.logString = "";
        this.logChannel = this.client.channels.find(c => c.id == this.settings.channels.log);
        this.name = this.client.user.username;
        
        this.log("Loading modules.");
        Object.values(this.modules).forEach(module => {
            let moduleName = module.getName();
            
            if(this.settings.modules.disabled.includes(moduleName)){
                this.log("Module " + moduleName + " is disabled, not loading it."); 
                delete this.modules[moduleName];
                return;
            }

            module.init(this); 
            this.log("Module " + moduleName + " loaded."); 
        });

        this.log("Loading commands.");
        Object.values(this.commands).forEach(command => {
            let commandName = command.getName();
            if(this.settings.commands.disabled.includes(commandName)){
                this.log("Command " + commandName + " is disabled, not loading it."); 
                delete this.commands[commandName];
                return;
            }

            let canBeEnabled = true;

            command.getDependencies().forEach(module => {
                if(this.modules[module] == undefined){
                    canBeEnabled = false;
                }
            });

            if(!canBeEnabled){
                this.log("Command " + commandName + " is disabled because dependencies modules are not loaded."); 
                delete this.commands[commandName];
                return;
            }
            
            command.fetchAliases().forEach(alias => {
                this.commandsAliases[alias] = commandName; 
            });
            
            this.commandsAliases[commandName] = commandName;
            
            command.init(this);
            this.log("Command " + commandName + " loaded."); 
        });

        
        this.log("Bot " + this.name + " started.");
        this.sendLog();
    }

    log(message){
        console.log(message);
        this.logString += message + "\n";
    }

    sendLog(){
        this.logChannel.send("```" + this.logString + "```");
    }

    message(message) {
        if(!message.content.startsWith(this.settings.prefix))
            return;

        if(message.author.id == this.client.user.id)
            return;

        let args = message.content.match(/[^\s"']+|"([^"]*)"|'([^']*)'/gm);

        let cmd = args[0].replace(this.settings.prefix, "").toLowerCase();
        let command = this.commands[this.commandsAliases[cmd]];

        if(command == undefined)
            return;
        
        let roles = command.getRoles();
        let havePermissions = false;
        let guild = message.guild;
        guild.fetchMember(message.author)
            .then(member => {
                roles.forEach(r => {
                    if(member.roles.find(role => role.id == this.settings.roles.permission[r]))
                        havePermissions = true;
                });
        
                if(!havePermissions)
                    return;
        
                args.shift();
                for(var i = 0; i < args.length; i++)
                {
                    args[i] = args[i].replace(/"/gm, '').replace(/'/gm, '');
                }
        
                console.log("User " + message.author.username + " used command " + message.content + ".");        
                let deleteMessage = command.call(args, message.channel, message.author, message);
        
                if(deleteMessage)
                    message.delete();
            }).catch(console.error);
    }
}

module.exports = SchoolDiscordBot;