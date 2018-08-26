
const Command = require("./Command");
const Discord = require('discord.js');
const fs = require('fs');

class VoteStartCommand extends Command {

    getName() {
        return "votestart";
    }
    getUsage(){
        return "votestart <global/private> <jméno hlasování> <popis hlasování> [možnosti rozdělene středníkem]"
    }
    getGroup(){
        return "vote";
    }
    getHelp(){
        return "Vytvoří hlasování o zadané věci."
    }

    init(client, settings, commands) {
        this.voteChannel = client.channels.find(channel => channel.id === settings.channels["vote"]);
        this.emojis = ["1⃣", "2⃣", "3⃣", "4⃣", "5⃣", "6⃣", "7⃣", "8⃣", "9⃣", "🔟"];
    }

    call(args, channel){
        if(args.length < 3 && arg.length > 4){
            this.sendHelp(channel);
            return;
        }

        let type = args[0];
        if(!["global", "private"].includes(type)){
            this.sendError(channel, "První argument musí být zda se jedná o globální (global) nebo o soukromé (private) hlasování.");
            return;
        }

        let votes = fs.readFileSync("./temp/votes.json", "utf8");
        let votesObject = JSON.parse(votes);

        let name = args[1];
        
        if(votesObject["votes"][name] != undefined){
            this.sendError(channel, "Hlasování s tímto jménem již existuje, zvolte prosím jiné jméno.");
            return;
        }

        let description = args[2];
        let options = {"👍": "ANO", "👎": "NE"};

        if(args.length != 3){
            let argOptions = args[3].split(";");

            if(argOptions.length > 10){
                this.sendError(channel, "Zadal jste více možností (>10) než je možné. Zadejte menší počet.");
                return;
            }

            options = {};

            let i = 0;
            argOptions.forEach(option => {
                options[this.emojis[i]] = option;   
                
                i++;
            });
        }

        let optionsString = "";

        Object.keys(options).forEach(optionEmoji => {
            optionsString += optionEmoji + " pro **" + options[optionEmoji] + "**\n";
        });

        let embed = new Discord.RichEmbed()
            .setTitle("📆 | Nové hlasování")
            .setDescription(description + "\n\nhlasujte pomocí reakce pro možnosti: \n" + optionsString)
            .setColor(0xe67e22);

        let voteChannel = channel;

        if(type == "global")
            voteChannel = this.voteChannel;

        voteChannel.send(embed).then(message => {
            let result = Promise.resolve();
            Object.keys(options).forEach(option => {
                result = result.then(() => message.react(option));
            });

            votesObject["votes"][name] = {"id": message.id, "description": description, "options": options, "channel": voteChannel.id};

            fs.writeFileSync("./temp/votes.json", JSON.stringify(votesObject));
        }).catch(console.error);

        return false;
    }

}

module.exports = VoteStartCommand;