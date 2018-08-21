
const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');

class VoteStartCommand extends Command {

    getName() {
        return "votestart";
    }
    getUsage(){
        return "votestart <jmeno hlasovani> <popis hlasování>"
    }
    getHelp(){
        return "Vytvoří globální hlasování o zadané věci."
    }

    init(client, settings, commands) {
        this.channel = client.channels.find(channel => channel.id === settings.channels["vote"]);
    }

    call(args){
        let name = args[0];
        args.shift();

        let description = "";
        args.forEach(word => {
            description += word + " ";
        });

        let embed = new Discord.RichEmbed()
            .setTitle("📆 | Nové hlasování")
            .setDescription(description + "\n\nhlasujte pomocí reakcí 👍 pro **ANO** a 👎 pro **NE**")
            .setColor(0xe67e22);

        this.channel.send(embed).then(message => {
            message.react("👍");
            message.react("👎");

            let votes = fs.readFileSync("./temp/votes.json", "utf8");
            let votesObject = JSON.parse(votes);
    
            votesObject["votes"][name] = {"id": message.id, "description": description};

            fs.writeFileSync("./temp/votes.json", JSON.stringify(votesObject));
        }).catch(console.error);
        return true;
    }

}

module.exports = VoteStartCommand;