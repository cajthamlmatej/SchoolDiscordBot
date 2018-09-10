const Command = require("./Command");
const Discord = require('discord.js');
const Translation = require("../Translation");

class UnMuteCommand extends Command {

    getName() {
        return "unmute";
    }
    getUsage() {
        return "unmute <jméno člena>"
    }
    getGroup(){
        return "manage";
    }
    getHelp() {
        return "Zruší umlčení člena."
    }
    getDependencies(){
        return [ "mutemodule" ];
    }

    init(bot) {
        this.muteModule = bot.modules.mutemodule;
    }

    call(args, channel){
        if(args.length != 1){
            this.sendHelp(channel);
            return;
        }
        
        let valid = [];
        channel.guild.members.forEach(member => {
            let name = member.nickname == undefined ? member.user.username : member.nickname;

            if(name.toLowerCase().includes(args[0].toLowerCase())){
                valid.push(member);    
            }
        });

        if(valid.length > 1){
            let list = "";

            valid.forEach(member => {
                let name = member.nickname == undefined ? member.user.username : member.nickname;
                list += "\n**" + name + "**";
            });
    
            list += "\n";
         
            const embed = new Discord.RichEmbed()
                .setTitle("🔇 | " + Translation.translate("command.mute.user-list.title"))
                .setDescription(Translation.translate("command.mute.user-list") + ".\n"+list)
                .setColor(0xe67e22)
                
            channel.send(embed);
            return;
        } else if(valid.length <= 0){            
            this.sendError(channel, "command.mute.user-not-found");
            return;
        }

        let member = valid[0];

        if(!this.muteModule.isMuted(member)){
            this.sendError(channel, "command.mute.not-muted");
            return;
        }
        
        this.muteModule.removeMute(member);

        const embed = new Discord.RichEmbed()
            .setTitle("🔇 | " + member.user.username + " " + Translation.translate("command.mute.unmuted.title"))
            .setDescription(member.user.username + " " + Translation.translate("command.mute.unmuted"))
            .setColor(0xbadc58);

        channel.send(embed);
        return true;
    }

}

module.exports = UnMuteCommand;