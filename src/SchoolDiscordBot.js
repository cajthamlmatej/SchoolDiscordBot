const Discord = require('discord.js');
const Translation = require("./Translation");
const moment = require('moment');
const fs = require('fs');

class SchoolDiscordBot {
    constructor() {
        this.startTime = moment();
    }

    start() {
        console.log("Starting client.");
        this.reload();
    }

    reload() {
        if (this.client != undefined) {
            console.log("Destroing client.");
            this.client.destroy();
        }

        this.client = new Discord.Client();

        this.disabledCommands = [];
        this.disabledModules = [];
        this.commandsAliases = {};
        this.recentCommandsUsage = new Set();

        this.loadConfig();
        this.loadModules();
        this.loadCommands();

        this.token = this.settings.token;

        console.log("Setting bot events.");
        this.client.on("ready", () => {
            this.ready();
        });

        this.client.on("message", (message) => {
            if (message.guild == null || message.guild.id != this.settings.guild)
                return;

            this.message(message);
            Object.values(this.modules).forEach(module => {
                module.event("message", { message: message });
            })
        });

        this.client.on("messageReactionAdd", (reactionMessage, user) => {
            if (reactionMessage.message.guild == null || reactionMessage.message.guild.id != this.settings.guild)
                return;

            Object.values(this.modules).forEach(module => {
                module.event("messageReactionAdd", { reactionMessage: reactionMessage, user: user });
            })
        });

        this.client.on("messageReactionRemove", (reactionMessage, user) => {
            if (reactionMessage.message.guild == null || reactionMessage.message.guild.id != this.settings.guild)
                return;

            Object.values(this.modules).forEach(module => {
                module.event("messageReactionRemove", { reactionMessage: reactionMessage, user: user });
            })
        });

        console.log("Login bot to discord.");
        this.client.login(this.token);
    }

    loadConfig() {
        console.log("Opening and reading settings file.");

        let fileContents = fs.readFileSync('./settings/settings.json');

        this.settings = JSON.parse(fileContents);
    }

    loadCommands() {
        let commands = {};
        console.log("Reading directory with commands.");
        let commandFiles = fs.readdirSync("./src/commands");

        commandFiles.forEach(file => {
            if (file == "Command.js" || file == "SubsCommand.js")
                return;

            let commandFile = require("./commands/" + file);
            let command = new commandFile();

            commands[command.getName()] = command;
        });

        this.commands = commands;
    }

    loadModules() {
        let modules = {};
        console.log("Reading directory with modules.");
        let moduleFiles = fs.readdirSync("./src/modules");

        moduleFiles.forEach(file => {
            if (file == "Module.js")
                return;

            let moduleFile = require("./modules/" + file);
            let module = new moduleFile();

            modules[module.getName()] = module;
        });

        this.modules = modules;
    }

    ready() {
        Translation.setLanguage(this.settings.language);

        this.name = this.client.user.username;

        console.log("Loading modules.");
        Object.values(this.modules).forEach(module => {
            let moduleName = module.getName();

            if (this.settings.modules.disabled.includes(moduleName)) {
                console.log("Module " + moduleName + " is disabled, not loading it.");
                this.disabledModules.push(moduleName);
                delete this.modules[moduleName];
                return;
            }

            module.init(this);
            console.log("Module " + moduleName + " loaded.");
        });

        console.log("Loading commands.");
        Object.values(this.commands).forEach(command => {
            let commandName = command.getName();
            if (this.settings.commands.disabled.includes(commandName)) {
                console.log("Command " + commandName + " is disabled, not loading it.");
                delete this.commands[commandName];
                return;
            }

            let canBeEnabled = true;

            command.getDependencies().forEach(module => {
                if (this.modules[module] == undefined) {
                    canBeEnabled = false;
                }
            });

            if (!canBeEnabled) {
                console.log("Command " + commandName + " is disabled because dependencies modules are not loaded.");
                this.disabledCommands.push(commandName);
                delete this.commands[commandName];
                return;
            }

            command.fetchAliases().forEach(alias => {
                this.commandsAliases[alias] = commandName;
            });

            this.commandsAliases[commandName] = commandName;

            command.init(this);
            console.log("Command " + commandName + " loaded.");
        });


        console.log("Bot " + this.name + " started.");
    }

    message(message) {
        if (!message.content.startsWith(this.settings.prefix))
            return;

        let authorId = message.author.id;

        if (authorId == this.client.user.id)
            return;

        let args = message.content.match(/[^\s"']+|"([^"]*)"|'([^']*)'/gm);

        let cmd = args[0].replace(this.settings.prefix, "").toLowerCase();
        let command = this.commands[this.commandsAliases[cmd]];

        if (command == undefined)
            return;

        if (this.recentCommandsUsage.has(authorId)) {
            const embed = new Discord.RichEmbed()
                .setTitle("❗ | " + Translation.translate("spam.alert.title"))
                .setColor(0xd63031)
                .setDescription(Translation.translate("spam.alert"));

            message.channel.send(embed);
            return;
        }

        this.recentCommandsUsage.add(authorId);

        setTimeout(() => {
            this.recentCommandsUsage.delete(authorId);
        }, this.settings.spam.cooldown * 1000);

        message.guild.fetchMember(message.author)
            .then(member => {
                args.shift();
                for (var i = 0; i < args.length; i++) {
                    args[i] = args[i].replace(/"/gm, '').replace(/'/gm, '');
                }

                let havePermissions = false;
                command.getRoles(args[0]).forEach(r => {
                    if (member.roles.find(role => role.id == this.settings.roles.permission[r]))
                        havePermissions = true;
                });

                if (!havePermissions)
                    return;


                console.log("User " + message.author.username + " used command " + message.content + ".");
                let deleteMessage = command.call(args, message);

                if (deleteMessage)
                    message.delete();
            }).catch(console.error);
    }
}

module.exports = SchoolDiscordBot;