
const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');

class RoleListCommand extends Command {

    getName() {
        return "rolelist";
    }
    getUsage() {
        return "rolelist"
    }
    getGroup(){
        return "main";
    }
    getRoles(){
        return ["member"];
    }
    getHelp() {
        return "Vypíše seznam rolí."
    }

    init(bot) {
        this.roles = bot.settings.roles;
    }

    call(args, channel){
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
        return false;
    }

}

module.exports = RoleListCommand;