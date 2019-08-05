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

    async start() {
        this.collector = new Discord.MessageCollector(this.build.channel, m => m.author.id === this.build.user.id && m.channel.id === this.build.channel.id);
        this.collector.on("collect", (message) => { this.collect(message); });
        this.collector.on("end", (messages, reason) => { this.end(messages, reason); });

        this.build.channel.send(await this.generateHelpEmbed(this.build.fields[this.field])).then(message => {
            this.message = message;
        });
    }

    async collect(message) {
        let messageContent = message.content;

        if (messageContent.toLowerCase() == this.stopWord.toLowerCase()) 
            this.collector.stop("forced");
        else {
            const field = this.build.fields[this.field];
            if (field.value != undefined) 
                messageContent = await field.value(messageContent, this.values, message.attachments.array());

            const passed = await field.validate(messageContent, this.values);

            if (passed === true) {
                this.values[field.name] = messageContent;

                if (this.build.fields[this.field + 1] == undefined) 
                    this.collector.stop("fieldEnd");
                else {
                    this.field += 1;

                    this.message.edit(await this.generateHelpEmbed(this.build.fields[this.field]));
                }
            } else 
                this.message.edit(await this.generateHelpEmbed(this.build.fields[this.field], passed));
            
            message.delete();
        }
    }

    async end(messages, reason) {
        this.message.edit(await this.generateEndEmbed(reason));

        switch (reason) {
        case "forced":
            break;
        case "fieldEnd":
            this.endFunction(this.values);
            break;
        }
    }

    async generateEndEmbed(reason) {
        let description = "";

        switch (reason) {
        case "forced":
            description += Translation.translate("builder.end");
            break;
        case "fieldEnd":
            description += Translation.translate("builder." + this.name + ".ok");
            break;
        }

        if(this.build.member == undefined){
            await this.build.channel.guild.fetchMember(this.build.user).then(member => { 
                this.build.member = member;
            });
        }

        const embed = new Discord.RichEmbed()
            .setTitle(Translation.translate("builder." + this.name + ".title"))
            .setDescription(description)
            .setColor(Config.getColor("SUCCESS"))
            .setFooter(this.build.member.displayName, this.build.user.avatarURL);

        return embed;
    }

    async generateHelpEmbed(field, error) {
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

        if(this.build.member == undefined){
            await this.build.channel.guild.fetchMember(this.build.user).then(member => { 
                this.build.member = member;
            });
        }

        const embed = new Discord.RichEmbed()
            .setTitle(Translation.translate("builder." + this.name + ".title"))
            .setDescription(description)
            .setColor(Config.getColor("SUCCESS"))
            .setFooter(this.build.member.displayName, this.build.user.avatarURL);

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