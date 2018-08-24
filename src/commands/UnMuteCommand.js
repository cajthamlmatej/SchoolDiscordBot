const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');

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

    init(client, settings, commands) {
        this.muteRole = settings["mute-role"];
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
                .setColor(0xe67e22)
                
            channel.send(embed);
            return;
        } else if(valid.length <= 0){            
            this.sendError(channel, "Nikoho s tímto jménem jsme nenašli. Zkontrolujte diakritiku a správnost jména.");
            return;
        }

        let member = valid[0];

        let mutes = fs.readFileSync("./temp/mutes.json", "utf8");
        let mutesObject = JSON.parse(mutes); 
        let mute = mutesObject["mutes"][member.user.id];

        if(mute == undefined){
            this.sendError(channel, "Vámi zvolený člen není umlčený.");
            return;
        }

        channel.guild.fetchMember(member.user.id).then(member => {
            member.setRoles(mute.roles);
        });
        
        delete mutesObject["mutes"][member.user.id];
        
        fs.writeFileSync("./temp/mutes.json", JSON.stringify(mutesObject));

        const embed = new Discord.RichEmbed()
            .setTitle("🔇 | " + member.user.username + " byl odmlčen")
            .setDescription(member.user.username + " již není umlčen.")
            .setColor(0xe67e22);

        channel.send(embed);
        return true;
    }

}

module.exports = UnMuteCommand;