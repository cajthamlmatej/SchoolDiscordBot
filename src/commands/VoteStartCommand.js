
const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');

class VoteStartCommand extends Command {

    getName() {
        return "votestart";
    }
    getUsage(){
        return "votestart <jméno hlasování> <popis hlasování>"
    }
    getGroup(){
        return "vote";
    }
    getHelp(){
        return "Vytvoří hlasování o zadané věci."
    }

    init(client, settings, commands) {
        this.voteChannel = client.channels.find(channel => channel.id === settings.channels["vote"]);
    }

    call(args, channel){
        if(args.length != 2){
            this.sendHelp(channel);
            return;
        }

        let votes = fs.readFileSync("./temp/votes.json", "utf8");
        let votesObject = JSON.parse(votes);

        let name = args[0];
        
        if(votesObject["votes"][name] != undefined){
            this.sendError(channel, "Hlasování s tímto jménem již existuje, zvolte prosím jiné jméno.");
            return;
        }

        let description = args[1];

        let embed = new Discord.RichEmbed()
            .setTitle("📆 | Nové hlasování")
            .setDescription(description + "\n\nhlasujte pomocí reakcí 👍 pro **ANO** a 👎 pro **NE**")
            .setColor(0xe67e22);

        this.voteChannel.send(embed).then(message => {
            message.react("👍").then(reaction => {
                message.react("👎");
            });
            
            votesObject["votes"][name] = {"id": message.id, "description": description};

            fs.writeFileSync("./temp/votes.json", JSON.stringify(votesObject));
        }).catch(console.error);

        return false;
    }

}

module.exports = VoteStartCommand;