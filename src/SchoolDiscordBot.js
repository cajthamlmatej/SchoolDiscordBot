const Discord = require("discord.js");
const Translation = require("./Translation");
const Config = require("./Config");
const DirectCommand = require("./commands/DirectCommand");
const SubsCommand = require("./commands/SubsCommand");
const moment = require("moment");
const fs = require("fs");
const logger = require("./Logger");
const database = require("./database/Database");

class SchoolDiscordBot {

    constructor() {
        this.startTime = moment();
    }

    start() {
        this.reload();
    }

    reload() {
        logger.info("Bot is reloading.");
        database.initialize();

        if (this.client != undefined) {
            logger.warn("Bot Discord client already exists. Destroying client.");
            this.client.destroy();
        }

        logger.info("Creating Discord client.");
        this.client = new Discord.Client();

        logger.info("Clearing default variables for commands, modules, aliases and recent commands usage.");
        this.disabledCommands = [];
        this.disabledModules = [];
        this.commandsAliases = {};
        this.recentCommandsUsage = new Set();

        this.loadConfig();
        this.loadModules();
        this.loadCommands();

        this.token = Config.get("bot.token");
        const guild = Config.get("bot.guild");

        logger.info("Setup of events.");

        this.client.on("ready", () => {
            this.ready();
        });

        this.client.on("message", (message) => {
            this.message(message);

            if (message.guild == null || message.guild.id != guild)
                return;

            Object.values(this.modules).forEach(module => {
                module.event("message", { message: message });
            });
        });

        this.client.on("messageReactionAdd", (reactionMessage, user) => {
            if (reactionMessage.message.guild == null || reactionMessage.message.guild.id != guild)
                return;

            Object.values(this.modules).forEach(module => {
                module.event("messageReactionAdd", { reactionMessage: reactionMessage, user: user });
            });
        });

        this.client.on("messageReactionRemove", (reactionMessage, user) => {
            if (reactionMessage.message.guild == null || reactionMessage.message.guild.id != guild)
                return;

            Object.values(this.modules).forEach(module => {
                module.event("messageReactionRemove", { reactionMessage: reactionMessage, user: user });
            });
        });

        this.client.on("voiceStateUpdate", (oldMember, newMember) => {
            Object.values(this.modules).forEach(module => {
                module.event("voiceStateUpdate", { oldMember: oldMember, newMember: newMember });
            });
        });

        logger.info("Logging bot into Discord API.");
        this.client.login(this.token);
    }

    loadConfig() {
        logger.info("Loading config...");
        logger.info("Validating Config variables.");
        Config.validate();
        logger.info("Config variables validated.");
    }

    loadCommands() {
        logger.info("Loading commands...");

        const commands = {};
        logger.info("Reading directory with commands.");
        const commandFiles = fs.readdirSync("./src/commands");

        commandFiles.forEach(file => {
            if (file == "Command.js" || file == "SubsCommand.js" || file == "DirectCommand.js")
                return;

            const commandFile = require("./commands/" + file);
            const command = new commandFile();

            commands[command.getName()] = command;
        });

        this.commands = commands;
    }

    loadModules() {
        logger.info("Loading modules...");

        const modules = {};
        logger.info("Reading directory with modules.");

        const moduleFiles = fs.readdirSync("./src/modules");

        moduleFiles.forEach(file => {
            if (file == "Module.js")
                return;

            const moduleFile = require("./modules/" + file);
            const module = new moduleFile();

            modules[module.getName()] = module;
        });

        this.modules = modules;
    }

    ready() {
        Translation.setLanguage(Config.get("bot.language"));

        this.name = this.client.user.username;

        logger.info("Loading bot modules...");
        Object.values(this.modules).forEach(module => {
            const moduleName = module.getName();

            if (Config.get("modules.disabled").includes(moduleName)) {
                logger.warn("  Module " + moduleName + " is disabled, not loading it.");
                this.disabledModules.push(moduleName);
                delete this.modules[moduleName];
                return;
            }

            module.init(this);
            logger.info(" Module " + moduleName + " loaded.");
        });

        logger.info("Loading bot commands...");
        Object.values(this.commands).forEach(command => {
            const commandName = command.getName();
            if (Config.get("commands.disabled").includes(commandName)) {
                logger.warn(" Command " + commandName + " is disabled, not loading it.");
                delete this.commands[commandName];
                return;
            }

            let canBeEnabled = true;

            command.getDependencies().forEach(module => {
                if (this.modules[module] == undefined) 
                    canBeEnabled = false;
                
            });

            if (!canBeEnabled) {
                logger.warn("  Command " + commandName + " is disabled because dependencies modules (" + command.getDependencies() + ") are not loaded.");
                this.disabledCommands.push(commandName);
                delete this.commands[commandName];
                return;
            }

            command.fetchAliases().forEach(alias => {
                this.commandsAliases[alias] = commandName;
            });

            this.commandsAliases[commandName] = commandName;

            command.init(this);
            logger.info(" Command " + commandName + " loaded.");

            if(command instanceof SubsCommand)
                Object.keys(command.getSubCommands()).forEach(name => {
                    logger.info("  Sub-command " + name + " loaded.");
                });
        });

        logger.info("Bot started.");
        logger.info("Sending message to server moderators.");
        const embed = new Discord.RichEmbed()
            .setTitle(Translation.translate("bot.started"))
            .setColor(0xbadc58);

        const adminChannel = this.client.channels.find(c => c.id == Config.get("channels.bot-info"));
        adminChannel.send(embed);
    }

    message(message) {
        const prefix = Config.get("bot.prefix");
        if (!message.content.startsWith(prefix))
            return;

        const authorId = message.author.id;

        if (authorId == this.client.user.id)
            return;

        const args = message.content.match(/[^\s"']+|"([^"]*)"|'([^']*)'/gm);

        const cmd = args[0].replace(prefix, "").toLowerCase();
        const command = this.commands[this.commandsAliases[cmd]];

        if(!(command instanceof DirectCommand))
            if (message.guild == null || message.guild.id != Config.get("bot.guild"))
                return;

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
        }, Config.get("bot.limit.command-usage") * 1000);

        this.client.guilds.get(Config.get("bot.guild")).fetchMember(message.author)
            .then(async (member) => {
                args.shift();
                for (let i = 0; i < args.length; i++) 
                    args[i] = args[i].replace(/"/gm, "").replace(/'/gm, "");

                let havePermissions = false;
                command.getRoles(args[0]).forEach(r => {
                    // TODO: too much 
                    if (member.roles.find(role => role.id == Config.get("roles.permissions")[r]))
                        havePermissions = true;
                });

                if (!havePermissions)
                    return;

                logger.info("User " + message.author.username + (member.nickname != undefined ? " (" + member.nickname + ")" : "") + " used command " + message.content + ".");
                const deleteMessage = await command.call(args, message);

                if (deleteMessage)
                    message.delete();
            }).catch(console.error);
    }
}

module.exports = SchoolDiscordBot;