const Discord = require("discord.js");
const Translation = require("./Translation");
const Config = require("./Config");

class CommandBuilder {

    constructor(name, user, channel, fields, end) {
        this.name = name;
        this.build = { user: user, fields: fields, channel: channel };
        this.field = 0;
        this.values = {};
        this.endFunction = end;
        
        this.stopWord = Config.get("bot.builder.stop-word");
    }

    start() {
        this.collector = new Discord.MessageCollector(this.build.channel, m => m.author.id === this.build.user.id && m.channel.id === this.build.channel.id);
        this.collector.on("collect", (message) => { this.collect(message); });
        this.collector.on("end", (messages, reason) => { this.end(messages, reason); });

        this.build.channel.send(this.generateHelpEmbed(this.build.fields[this.field])).then(message => {
            this.message = message;
        });
    }

    collect(message) {
        const messageContent = message.content;

        if (messageContent.toLowerCase() == this.stopWord.toLowerCase()) 
            this.collector.stop("forced");
        else {
            const field = this.build.fields[this.field];
            const passed = field.validate(messageContent, this.values);

            if (passed === true) {
                if (field.value != undefined) 
                    this.values[field.name] = field.value(messageContent, this.values, message.attachments.array());
                else 
                    this.values[field.name] = messageContent;

                if (this.build.fields[this.field + 1] == undefined) 
                    this.collector.stop("fieldEnd");
                else {
                    this.field += 1;

                    this.message.edit(this.generateHelpEmbed(this.build.fields[this.field]));
                }
            } else 
                this.message.edit(this.generateHelpEmbed(this.build.fields[this.field], passed));
            
            message.delete();
        }
    }

    end(messages, reason) {
        this.message.edit(this.generateEndEmbed(reason));

        switch (reason) {
        case "forced":
            break;
        case "fieldEnd":
            this.endFunction(this.values);
            break;
        }
    }

    generateEndEmbed(reason) {
        let description = "";

        switch (reason) {
        case "forced":
            description += Translation.translate("builder.end");
            break;
        case "fieldEnd":
            description += Translation.translate("builder." + this.name + ".ok");
            break;
        }

        const embed = new Discord.RichEmbed()
            .setTitle(Translation.translate("builder." + this.name + ".title"))
            .setDescription(description)
            .setColor(0xbadc58)
            .setFooter(this.build.user.username, this.build.user.avatarURL);

        return embed;
    }

    generateHelpEmbed(field, error) {
        const fieldName = field.name;
        let description = "";

        description += Translation.translate("builder." + this.name + "." + fieldName + ".title") + "\n\n";
        description += Translation.translate("builder." + this.name + "." + fieldName + ".help") + "\n";

        if (Array.isArray(field.example)) {
            const list = [];

            field.example.forEach(example => {
                list.push("`" + example + "`");
            });

            description += Translation.translate("builder.example", list.join(" / "));
        } else
            description += Translation.translate("builder.example", "`" + field.example + "`");

        description += "\n\n" + Translation.translate("builder.stop", this.stopWord);

        const embed = new Discord.RichEmbed()
            .setTitle(Translation.translate("builder." + this.name + ".title"))
            .setDescription(description)
            .setColor(0xbadc58)
            .setFooter(this.build.user.username, this.build.user.avatarURL);

        if (error != undefined && error != true) {
            let errorMessage = "";

            if (Array.isArray(error))
                errorMessage = Translation.translate(error[0], error[1]);
            else
                errorMessage = Translation.translate(error);

            embed.addField(Translation.translate("builder.error"), errorMessage);
        }

        return embed;
    }

}

module.exports = CommandBuilder;