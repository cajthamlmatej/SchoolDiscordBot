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
    getHelp() {
        return "Zruší umlčení člena."
    }

    init(client, settings, commands) {
        this.channel = client.channels.find(channel => channel.id === settings.channels["admin-bot"]);
        this.muteRole = settings["mute-role"];
    }

    call(args){
        let valid = [];
        this.channel.guild.members.forEach(member => {
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
                
            this.channel.send(embed);
            return;
        } else if(valid.length <= 0){
            const embed = new Discord.RichEmbed()
                .setTitle("🔇 | Nikoho s tímto jménem jsme nenašli")
                .setDescription("Zkontrolujte diakritiku a správnost jména.")
                .setColor(0xe74c3c)
                
            this.channel.send(embed);
            return;
        }

        let member = valid[0];

        let mutes = fs.readFileSync("./temp/mutes.json", "utf8");
        let mutesObject = JSON.parse(mutes); 
        let mute = mutesObject["mutes"][member.user.id];

        if(mute == undefined){
            const embed = new Discord.RichEmbed()
                .setTitle("🔇 | Člen není umlčený")
                .setDescription("Vámi zvolený člen není umlčený.")
                .setColor(0xe74c3c)
                
            this.channel.send(embed);
            return;
        }

        this.channel.guild.fetchMember(member.user.id).then(member => {
            member.removeRoles(member.roles).then(member => {
                member.addRoles(mute.roles);
                member.removeRole(this.muteRole);
            });
        });
        
        delete mutesObject["mutes"][member.user.id];
        
        fs.writeFileSync("./temp/mutes.json", JSON.stringify(mutesObject));

        const embed = new Discord.RichEmbed()
            .setTitle("🔇 | " + member.user.username + " byl odmlčen")
            .setDescription(member.user.username + " již není umlčen.")
            .setColor(0xe67e22);

        this.channel.send(embed);
        return false;
    }

}

module.exports = UnMuteCommand;