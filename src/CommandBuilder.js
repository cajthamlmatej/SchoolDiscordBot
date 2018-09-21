const Discord = require('discord.js');
const Translation = require("./Translation");

class CommandBuilder {

    constructor(user, fields, channel, title){
        this.build = {user: user, fields: fields, title: title, channel: channel};
        this.field = 0;
        this.stopWord = "stop";
        this.values = {};
    }

    start() {
        this.collector = new Discord.MessageCollector(this.build.channel, m => m.author.id === this.build.user.id);
        this.collector.on("collect", (message) => { this.collect(message); });
        this.collector.on("end", (messages, reason) => { this.end(messages, reason); });

        this.build.channel.send(this.generateEmbed(this.build.fields[this.field])).then(message => {
            this.message = message;
        });
    }

    collect(message) {
        let messageContent = message.content;
        console.log("collected: " + messageContent);
    
        if(messageContent.toLowerCase() == this.stopWord.toLowerCase()){
            this.collector.stop("forced");
        } else {
            let field = this.build.fields[this.field]
            let passed = field.validate(messageContent);

            if(passed === true){
                if(field.value != undefined){    
                   this.values[field.name] = field.value(messageContent, this.values);
                } else {
                    this.values[field.name] = messageContent;
                }

                if(this.build.fields[this.field + 1] == undefined){
                    this.collector.stop("fieldEnd");
                } else {
                    this.field += 1;

                    this.message.edit(this.generateEmbed(this.build.fields[this.field], passed));
                }
            }
            message.delete();
        }
    }

    end(messages, reason){
        console.log("Collector end, reason: " + reason);
    }

    generateEmbed(field, error){
        let description = "";

        description += field.title + "\n\n";
        description += field.help + "\n";
        if(Array.isArray(field.example)){
            description += "Example: ";
            let list = [];

            field.example.forEach(example => {
                list.push("`" + example + "`");
            });

            description += list.join(" / ");
        } else 
            description += "Example: `" + field.example + "`\n";
        

        let embed = new Discord.RichEmbed()
            .setTitle(Translation.translate(this.build.title))
            .setDescription(description)
            .setColor(0x34ace0)
            .setFooter(this.build.user.username, this.build.user.avatarURL);

        if(error != undefined && error != true){
            embed.addField("Chyba", error);
        }

        return embed;
    }

}

module.exports = CommandBuilder;