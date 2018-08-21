const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');

class MuteCommand extends Command {

    getName() {
        return "mute";
    }
    getUsage() {
        return "mute <jméno člena> <na kolik minut> <důvod>"
    }
    getHelp() {
        return "Umlčí člena na zadanný počet minut."
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

        let minutes = args[1];
        if(minutes <= 0 || minutes >= 1440){
            const embed = new Discord.RichEmbed()
                .setTitle("🔇 | Nesprávný počet minut")
                .setDescription("Počet minut k umlčení není správný, minimum minut je 1 a nejvíce je 1440.")
                .setColor(0xe74c3c)
                
            this.channel.send(embed);
            return;
        }

        let member = valid[0];
        if(member.roles.find(role => role.id == this.muteRole) != undefined){
            const embed = new Discord.RichEmbed()
                .setTitle("🔇 | Člen je již umlčený")
                .setDescription("Vámi zvolený člen je již umlčený.")
                .setColor(0xe74c3c)
                
            this.channel.send(embed);
            return;
        }
        
        let reason = args[2];
        let expiration = moment().add(minutes, "m").format("X");
        let roles = [];

        let mutes = fs.readFileSync("./temp/mutes.json", "utf8");
        let mutesObject = JSON.parse(mutes); 

        member.roles.forEach(role => {
            roles.push(role.id);
        });

        member.removeRoles(member.roles).then(member => {
            member.addRole(this.muteRole);
            member.addRole(this.muteRole);

            const embedDM = new Discord.RichEmbed()
                .setTitle("🔇 | Byl jste umlčen")
                .setDescription("Na serveru jste byl umlčen.")
                .setColor(0xe67e22)
                .addField("Čas", minutes + " minut", true)
                .addField("Důvod", reason, false);

            member.createDM().then(channel => {
                channel.send(embedDM);
            });

            const embed = new Discord.RichEmbed()
                .setTitle("🔇 | " + member.user.username + " byl umlčen")
                .setDescription("Na serveru byl umlčen " + member.user.username + ".")
                .setColor(0xe67e22)
                .addField("Čas", minutes + " minut", true)
                .addField("Důvod", reason, false);

            this.channel.send(embed);

            mutesObject["mutes"][member.user.id] = {expiration: expiration, reason: reason, roles: roles}

            fs.writeFileSync("./temp/mutes.json", JSON.stringify(mutesObject));
        });

        return false;
    }

}

module.exports = MuteCommand;