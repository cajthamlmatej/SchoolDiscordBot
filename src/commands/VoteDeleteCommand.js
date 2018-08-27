
const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');

class VoteDeleteCommand extends Command {

    getName() {
        return "votedelete";
    }
    getUsage(){
        return "votedelete <jméno hlasování>"
    }
    getGroup(){
        return "vote";
    }
    getHelp(){
        return "Smaže hlasování z paměti."
    }

    init(bot) {
    }

    call(args, channel){
        if(args.length != 1){
            this.sendHelp(channel);
            return;
        }

        let votes = fs.readFileSync("./temp/votes.json", "utf8");
        let votesObject = JSON.parse(votes);
        let name = args[0];
        
        if(votesObject["votes"][name] == undefined){
            this.sendError(channel, "Hlasování s tímto jménem nebylo nalezeno. Výpis všech hlasování provedete příkazem votelist.");
            return;
        }

        delete votesObject["votes"][name];

        const embed = new Discord.RichEmbed()
            .setTitle("📆 | Hlasování bylo smazáno.")
            .setDescription("Hlasování bylo úspěšně smazáno z paměti.")
            .setColor(0xe67e22);

        channel.send(embed);

        fs.writeFileSync("./temp/votes.json", JSON.stringify(votesObject));
        return false;
    }

}

module.exports = VoteDeleteCommand;