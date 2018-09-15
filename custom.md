# How to create custom commands and modules!
First of all,  you need to know what commands and modules are.

## What you will need
- Any IDE you want (for example, Visual Studio Code).
- Some knowledge of JavaScript language.
- Little effort.

## What are commands and modules?
### Commands
Commands are things that member (or  moderator - permissions) can call. There are two types of commands:
- Command, *without subcommands*
- SubsCommand, *with multiple commands*

### Module
Module are just "manager" between command and discord api (beacuse OOP). Modules can react to events, atm there are just three events - message, reactionAdd and reactionRemove. Command can get dependency to any module.

## How to create custom command
Bot automatically load commands from folder `src/commands`. So, you need to create file inside that folder called with name you want to command be named. If you, for example, want to create command `say`, your file would be named `SayCommand.js`. The next thing you need to know it, what command you want - with or without subcommands.

### Command without subcommands
Insert the following code inside your created file, everything you need to know is in comments:

```javascript
// Without commands = Command
const Command = require("./Command");
// Discord API
const Discord = require('discord.js');
// Translation api
const Translation = require("../Translation");

// (NameOfCommand)Command extends Command
class SayCommand extends Command {

    getName() {
        // returns name of the command without prefix
        return "say";
    }

    getGroup() {
        // return name of group of command (they are specified in lang files, you can add new ones)
        return "manage";
    }
    
    
    getDependencies() {
        // return list of modules that command depend to, if command dont have any, you can delete entire method
        return ["name of module"];
    }
    
    getRoles() {
        // returns list of roles that have access to command (roles are specified in config), if method is not in command class, bot presumes it is only for moderator
        return ["name of role", "member"];
    }
    
    getAliases() {
        // return list of alieases that command have, if command dont have any, you can delete entire method
        return ["tell"];
    }

    init(bot) {
        // init
    }

    call(args, message) {
        // return boolean, if true, delete message.
        return true;
    }

}

// Return command to exports
module.exports = SayCommand;
```

Init method is called when command is loaded by bot. Inside init method, you can read config data by `bot.config["path.to.data"]`, you can easily add any configuration to config. If you need to access to module, dont forget to add module dependency and you can access to module by `bot.modules["moduleName"]`.

Call method takes two arguments - one is list of arguments that are passed and other is reference to command, that you can modify or read. In call method, you will write your code. If you need dependency, add variable in init and access to it by `this`.

Inside command class you can use methods `this.sendHelp(channel)`, that send help for command to specified channel and `this.sendError(channel, reason, ...args)`, that send translated error message (look to language/en.json) to the specified channel.
If your command use arguments, dont forget to check every one of them if is correct and also check if right number of them is passed. 
```javascript
if (args.length != 2) {
    this.sendHelp(channel);
    return;
}
```

#### Example command 
```javascript
const Command = require("./Command");
const Discord = require('discord.js');
const Translation = require("../Translation");

class SayCommand extends Command {

    getName() {
        return "say";
    }

    getGroup() {
        return "manage";
    }

    init(bot) {
        this.client = bot.client;
    }

    call(args, message) {
        let channel = message.channel;
        if (args.length != 2) {
            this.sendHelp(channel);
            return;
        }

        let channelName = args[0];
        let msg = args[1];

        let channelMatch = /<#([0-9]+)>/g.exec(channelName)[1];
        let channelSay = this.client.channels.find(ch => ch.id == channelMatch);


        const embed = new Discord.RichEmbed()
            .setTitle("🤐 | " + Translation.translate("command.notice.notice"))
            .setDescription(msg)
            .setFooter(message.author.username, message.author.avatarURL)
            .setColor(0xbadc58);

        channelSay.send(embed);

        return true;
    }

}

module.exports = SayCommand;
```


### Command **__with__** subcommands
SubsCommand commands are *almost* same as regular commands. Inside your created file insert following templatee, everything you need to know is in comments:
```javascript
const SubsCommand = require("./SubsCommand");

class AnnouncementCommand extends SubsCommand {

    getSubCommands() {
        // returns list of subcommands
        return {
            // name of subcommand
            "create": {
                // minimal count of arguments that subcommand takes
                "arguments": 3,
                // what roles can use this subcommand
                "roles": ["moderator"]
            },
            "list": {
                "arguments": 0,
                "roles": ["moderator"]
            },
            "edit": {
                "arguments": 3,
                "roles": ["moderator"]
            },
            "delete": {
                "arguments": 1,
                "roles": ["moderator"]
            }
        }
    }

    getName() {
        // name of the main command
        return "annoucement";
    }

    getGroup() {
        // group name of the main command
        return "manage";
    }

    getAliases() {
        // list of aliases of the main command
        return ["annouce"];
    }

    init(bot) {
        // init
    }

    callList(args, message) {
        return false;
    }

    callEdit(args, message) {
        return false;
    }

    callDelete(args, message) {
        return false;
    }

    callCreate(args, message) {
        return false;
    }

}

module.exports = AnnouncementCommand;
```

The only difference between SubsCommand and Command are methods `call<SubCommand>(...)` and `getSubCommands()`. Method `call<SubCommand>(...)` are called after argument-length check and also after permission check. That mean, you dont need to check if right count of arguments are passed to the command. If you need "dont-required" arguments, set subcommand arguments to the lowest arguments count possible and check afterwards. 

## How to create custom module
Modules have a lot in common with commands, they are automaticaly laoded by bot. Create file inside `src/modules` folder with name that you want to module be called. Insert following template to the file, everything important is in comments:
```javascript
const Module = require("./Module");

// (NameOfTheModule)Module extends Module
class AutoReactionModule extends Module {

    getName() {
        // returns name of the module
        return "autoreactionmodule";
    }

    init(bot) {
        // init
    }

    event(name, args) {
        if (name != "message")
            return;

        let message = args.message;
        // Event message args contains message that you can access.
    }
}

module.exports = AutoReactionModule;
```

If you need example modules, look into any module inside `src/modules` folder. 

## Everything should be translateable
If you know you will never translate commands and modules to other languages, simply dont do it. If you want to translate everything, you can access to Translation API translation by calling `Translation.translate(path, ...arguments)`. It automaticaly decide from what language it should string take. Example string-translation that you can add to the language files: 
```
"command.ping.ping": "Bot ping is {0}ms.",
```
Dont forget that you need have reference to the Translation API by doing so: 
```javascript
const Translation = require("../Translation");
```

Key is path that you enter to translate method, value is what should be printed. Value can contains arguments - for example {0} takes first arguments that are entered to translate method. It can be any number and any order. 