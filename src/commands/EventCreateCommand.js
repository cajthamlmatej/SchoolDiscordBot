
const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');

class EventCreateCommand extends Command {

    getName() {
        return "eventcreate";
    }
    getUsage() {
        return "eventcreate <udalost/ukol> <od kdy> <do kdy> <role> <místo> <předmět> <popis>"
    }
    getGroup(){
        return "school";
    }
    getHelp() {
        return "Vytvoří událost/úkol, který se po týdnu archívuje."
    }

    init(client, settings, commands) {
        this.eventChannel = client.channels.find(channel => channel.id === settings.channels["event"]);

        this.roles = settings.roles;
    }

    call(args, channel){
        if(args.length != 7){
            this.sendHelp(channel);
            return;
        }

        let type = args[0];

        if(type !== "udalost" && type !== "ukol"){
            this.sendError(channel, "Zadal jste špatný typ eventu, musí se jednat o `udalost` nebo `ukol`");
            return;
        }
        

        let from = args[1];
        let to = args[2];


        let role = args[3];
        let roles = Object.keys(this.roles);

        if(!roles.includes(role)){
            this.sendError(channel, "Žádnou roli s tímto jménem jsme nenašli. Seznam všech rolí vypíšete pomocí příkazu rolelist.")

            return;
        }
        

        let place = args[4];
        let subject = args[5];
        let description = args[6];
     
        let embed = new Discord.RichEmbed()
            .setTitle("🕜 | " + (type == "udalost") ? "Nová událost" : "Nový úkol")
            .setDescription(description)
            .setColor(0xe67e22);

        embed.addField("Skupina", channel.guild.roles.find(role => role.id == this.roles[role]), true);
        embed.addField("Předmět", subject == "all" ? "?" : subject, true);
        
        embed.addField(from == to ? "Datum" : "Od kdy do kdy", from == to ? to : (from + " do " + to), true);
        embed.addField("Místo", place == "all" ? "Škola" : place);
        
        this.eventChannel.send(embed).then(message => {
            let events = fs.readFileSync("./temp/events.json", "utf8");
            let eventsObject = JSON.parse(events);

            eventsObject["events"][message.id] = to;

            fs.writeFileSync("./temp/events.json", JSON.stringify(eventsObject));
        });

        return false;
    }

}

module.exports = EventCreateCommand;