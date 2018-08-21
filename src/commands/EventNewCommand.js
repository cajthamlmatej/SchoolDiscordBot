
const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');

class EventNewCommand extends Command {

    getName() {
        return "eventnew";
    }
    getUsage() {
        return "eventnew <udalost/ukol> <od kdy> <do kdy> <sku1/sku2/ang1/ang2/all> <místo/all> <předmět/all> <popis>"
    }
    getHelp() {
        return "Vytvoří událost nebo úkol do channelu #úkoly-a-události."
    }

    init(client, settings, commands) {
        this.channel = client.channels.find(channel => channel.id === settings.channels["event"]);
        this.botChannel = client.channels.find(channel => channel.id === settings.channels["admin-bot"]);
        this.roles = this.botChannel.guild.roles;

        this.groups = settings.groups;
    }

    call(args){
        let type = args[0];

        if(type !== "udalost" && type !== "ukol"){
            console.log(type);
            return;
        }

        let from = args[1];
        let to = args[2];


        let group = args[3];
        let groups = ["sku1", "sku2", "ang1", "ang2", "all"];

        if(!groups.includes(group)){
            console.log(group);
            console.log(groups);
            return;
        }

        let place = args[4];
        let subject = args[5];
        let description = args[6];
        
     
        let embed = new Discord.RichEmbed()
            .setTitle("🕜 | " + (type == "udalost") ? "Nová událost" : "Nový úkol")
            .setDescription(description)
            .setColor(0xe67e22);

        embed.addField("Skupina", this.roles.find(role => role.id == this.groups[group]), true);
        embed.addField("Předmět", subject == "all" ? "?" : subject, true);
        
        embed.addField(from == to ? "Datum" : "Od kdy do kdy", from == to ? to : (from + " do " + to), true);
        embed.addField("Místo", place == "all" ? "Škola" : place);
        
        this.channel.send(embed).then(message => {
            let events = fs.readFileSync("./temp/events.json", "utf8");
            let eventsObject = JSON.parse(events);

            eventsObject["events"][message.id] = to;

            fs.writeFileSync("./temp/events.json", JSON.stringify(eventsObject));
        });

        return false;
    }

}

module.exports = EventNewCommand;