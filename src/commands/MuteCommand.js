const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');
const moment = require('moment');

class MuteCommand extends Command {

    getName() {
        return "mute";
    }
    getUsage() {
        return "mute <jméno člena> <počet minut> <důvod>"
    }
    getGroup(){
        return "manage";
    }
    getHelp() {
        return "Umlčí **člena** na zadaný počet minut."
    }

    init(bot) {
        this.muteRole = bot.settings["mute-role"];
        this.moderatorRole = bot.settings["moderator-role"];
    }

    call(args, channel){
        if(args.length != 3){
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

        let minutes = args[1];
        if(minutes <= 0 || minutes >= 1440){
            this.sendError(channel, "Nesprávný počet minut. Počet minut k umlčení není správný, minimum minut je 1 a nejvíce je 1440.");
            return;
        }

        let member = valid[0];

        let mutes = fs.readFileSync("./temp/mutes.json", "utf8");
        let mutesObject = JSON.parse(mutes); 

        if(mutesObject["mutes"][member.user.id] != undefined){
            this.sendError(channel, "Vámi zvolený člen je již umlčený.");
            return;
        }

        if(member.roles.find(r => r.id == this.moderatorRole) != undefined){
            this.sendError(channel, "Vámi zvolený člen je moderátor. Nemůžete umlčet moderátora.");
            return;
        }
        
        let reason = args[2];
        let expiration = moment().add(minutes, "m").format("X");
        let roles = [];

        member.roles.forEach(role => {
            roles.push(role.id);
        });

        member.setRoles([this.muteRole]).then(member => {
            const embedDM = new Discord.RichEmbed()
                .setTitle("🔇 | Byl jste umlčen")
                .setDescription("Na serveru jste byl umlčen.")
                .setColor(0xe67e22)
                .addField("Čas", minutes + " minut", true)
                .addField("Důvod", reason, false);

            const embed = new Discord.RichEmbed()
                .setTitle("🔇 | " + member.user.username + " byl umlčen")
                .setDescription("Na serveru byl umlčen " + member.user.username + ".")
                .setColor(0xe67e22)
                .addField("Čas", minutes + " minut", true)
                .addField("Důvod", reason, false);

            member.createDM().then(channel => {
                channel.send(embedDM);
            });
            channel.send(embed);

            mutesObject["mutes"][member.user.id] = {expiration: expiration, reason: reason, roles: roles};

            fs.writeFileSync("./temp/mutes.json", JSON.stringify(mutesObject));
        }).catch(console.error);

        return true;
    }

}

module.exports = MuteCommand;