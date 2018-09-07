const Command = require("./Command");
const Discord = require('discord.js');

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
                .setTitle("🔇 | Seznam všech možných uživatelů")
                .setDescription("Určete jméno člena více podrobně.\n"+list)
                .setColor(0xf0932b)
                
            channel.send(embed);
            return;
        } else if(valid.length <= 0){            
            this.sendError(channel, "Nikoho s tímto jménem jsme nenašli. Zkontrolujte diakritiku a správnost jména.");
            return;
        }

        let member = valid[0];

        if(!this.muteModule.isMuted(member)){
            this.sendError(channel, "Vámi zvolený člen není umlčený.");
            return;
        }
        
        this.muteModule.removeMute(member);

        const embed = new Discord.RichEmbed()
            .setTitle("🔇 | " + member.user.username + " byl odmlčen")
            .setDescription(member.user.username + " již není umlčen.")
            .setColor(0xbadc58);

        channel.send(embed);
        return true;
    }

}

module.exports = UnMuteCommand;